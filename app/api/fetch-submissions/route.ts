// app/api/fetch-submissions/route.ts
import { NextResponse } from 'next/server';
import { google }        from 'googleapis';
import { Buffer }        from 'buffer';

function loadServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_KEY_JSON_B64!;
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

export async function GET() {
  const svc = loadServiceAccount();
  svc.private_key = svc.private_key.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: svc,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SHEET_ID!;
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A2:J',
  });
  const rows = resp.data.values ?? [];

  const submissions = rows.map((r, i) => ({
    rowIndex:      i + 2,
    OriginalQuery: r[0] || '',
    Prompt:        r[1] || '',
    ModifiedQuery: r[2] || '',
    Status:        r[3] || '',
    SubmittedBy:   r[4] || '',
    ApprovedBy:    r[5] || '',
    Timestamp:     r[6] || '',
    BankName:      r[7] || '',
    Segment:       r[8] || '',
    // column-9 might be anything else…
  }));

  return NextResponse.json(submissions);
}
