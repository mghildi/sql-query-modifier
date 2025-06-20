// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Buffer } from 'buffer';

function loadServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_KEY_JSON_B64!;
  const json = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(json) as { client_email: string; private_key: string; [k: string]: any };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bank    = searchParams.get('bank')!;
  const segment = searchParams.get('segment')!;

  const svc = loadServiceAccount();
  svc.private_key = svc.private_key.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: svc,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // *** Read Sheet1 – adjust columns to where “approved queries” live ***
  // e.g. maybe Column C holds the SQL, Column A=bank, B=segment, C=query
  const spreadsheetId = process.env.SHEET_ID!;
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A2:C',
  });

  const rows = resp.data.values ?? [];
  const matches = rows
  .filter(row => row.length >= 3)
  .filter(([b, s]) =>
    b?.trim().toLowerCase() === bank.toLowerCase() &&
    s?.trim().toLowerCase() === segment.toLowerCase()
  )
  .map(([, , sql]) => ({
    originalQuery: (sql || '').replace(/^"+|"+$/g, '')
  }));



  return NextResponse.json(matches);
}
