// File: app/api/send-for-approval/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { format } from 'date-fns-tz';

const istTimestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss", {
  timeZone: 'Asia/Kolkata'
});


// === Shared helper to decode Base64 JSON creds ===
function loadServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_KEY_JSON_B64;
  if (!b64) throw new Error('Missing env var GOOGLE_SERVICE_KEY_JSON_B64');
  const raw = Buffer.from(b64, 'base64').toString('utf8');
  const svc = JSON.parse(raw) as any;
  svc.private_key = svc.private_key.replace(/\\n/g, '\n');
  return svc;
}

export async function POST(req: Request) {
  try {
    const {
      originalQuery,
      prompt,
      modifiedQuery,
      submittedBy,
      bank,
      segment,
      sheet1RowIndex   // zero-based index of the data row in Sheet1
    } = await req.json();

    // const HEADER_ROWS   = 1;  // number of header rows in Sheet1
    // const sheet1RowNum  = sheet1RowIndex + HEADER_ROWS + 1; // real spreadsheet row
    const sheet1RowNum = sheet1RowIndex;
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';

    // === Authenticate ===
    const svc  = loadServiceAccount();
    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1) Append into Submissions
    const values = [[
      istTimestamp,
      bank,
      segment,
      originalQuery,
    
      modifiedQuery,
      'Pending',       // Status
      submittedBy,     // SubmittedBy
      '',              // ApprovedBy
      
      
    ]];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Submissions!A2:I',        // lock in the header row
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    // 2) Delete that row from Sheet1
    if (sheet1RowIndex != null) {
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const sheet1Id = meta.data.sheets!
        .find(s => s.properties?.title === 'Sheet1')!
        .properties!.sheetId!;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId:   sheet1Id,
                dimension: 'ROWS',
                startIndex: sheet1RowNum - 1,  // zero-based inclusive
                endIndex:   sheet1RowNum        // exclusive
              }
            }
          }]
        }
      });
    }

    return NextResponse.json({ status: 'submitted' });
  } catch (err: any) {
    console.error('Error in send-for-approval API:', err);
    return NextResponse.json(
      { error: `Failed to submit: ${err.message}` },
      { status: 500 }
    );
  }
}
