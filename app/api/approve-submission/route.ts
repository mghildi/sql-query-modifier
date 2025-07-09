// app/api/approve-submission/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { format } from 'date-fns-tz';

const istTimestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss", {
  timeZone: 'Asia/Kolkata'
});

// === NEW helper to load the service account ===
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
    const { rowIndex, approvedBy } = await req.json();
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';

    // === Use loadServiceAccount instead of keyFile ===
    const svc = loadServiceAccount();
    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read the row from Submissions
    const sheetName = 'Submissions';
    const rowNum = rowIndex;
    const readRange = `${sheetName}!A${rowNum}:I${rowNum}`;
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: readRange });
    const row = resp.data.values?.[0];
    if (!row) {
      return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    }

    // Append to Approved
    const approvedValues = [
      istTimestamp,
      row[1], // Bank
      row[2], // Segment
      row[3], // OriginalQuery
      row[4], // ModifiedQuery
      'Approved',
      row[6], // SubmittedBy
      approvedBy,
    
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Approved!A2:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [approvedValues] },
    });

    // Delete from Submissions
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = sheetMeta.data.sheets!
      .find(s => s.properties!.title === sheetName)!
      .properties!.sheetId!;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowNum - 1,
              endIndex: rowNum
            }
          }
        }]
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in approve-submission:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}