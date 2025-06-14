// File: app/api/reject-submission/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

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
    const { rowIndex, rejectedBy } = await req.json();
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const sheetName     = 'Submissions';

    // === Authenticate with Google using Base64 creds ===
    const svc  = loadServiceAccount();
    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Look up the sheetId for “Submissions”
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = meta.data.sheets!
      .find(s => s.properties?.title === sheetName)!
      .properties!.sheetId!;

    // Compute the exact row number (A2→row#2 etc.)
    const excelRow = rowIndex;

    // Read that row’s values
    const readRange = `${sheetName}!A${excelRow}:I${excelRow}`;
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: readRange });
    const row = resp.data.values?.[0];
    if (!row) {
      return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    }

    // Build the “rejected” row
    const rejectValues = [
      row[0],           // OriginalQuery
      row[1],           // Prompt
      row[2],           // ModifiedQuery
      'Rejected',       // Status
      row[4] || '',     // SubmittedBy
      rejectedBy,       // RejectedBy
      new Date().toISOString(), // Timestamp
      row[7] || '',     // BankName
      row[8] || ''      // Segment
    ];

    // Append to Decline!A2:I
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Decline!A2:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rejectValues] },
    });

    // Delete original row from Submissions
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: excelRow - 1, // zero-based
              endIndex: excelRow        // exclusive
            }
          }
        }]
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error rejecting submission:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
