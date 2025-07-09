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
  const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A2:J',
  });
  const rows = resp.data.values ?? [];

  const submissions = rows.map((r, i) => ({
    rowIndex:      i + 2,
    OriginalQuery: r[3] || '',
  
    ModifiedQuery: r[4] || '',
    Status:        r[5] || '',
    SubmittedBy:   r[6] || '',
    ApprovedBy:    r[7] || '',
    Timestamp:     r[0] || '',
    BankName:      r[1] || '',
    Segment:       r[2] || '',
    // column-9 might be anything else…
  }));

  return NextResponse.json(submissions);
}
