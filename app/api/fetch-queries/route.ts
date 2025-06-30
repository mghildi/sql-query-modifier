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
  console.log("Received in API:", bank, segment);
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
    range: 'Sheet1!A2:C',
  });

  const rows = resp.data.values ?? [];
  // Log all rows to see potential near matches
  rows.forEach((row, i) => {
    const b = row[0]?.trim().toLowerCase();
    const s = row[1]?.trim().toLowerCase();
    const targetB = bank.trim().toLowerCase();
    const targetS = segment.trim().toLowerCase();

    // Log if either part is close to matching
    if (b?.includes(targetB) || s?.includes(targetS)) {
      console.log(`Possible match at row ${i + 2}: bank="${b}", segment="${s}"`);
    }
  });
  const normalize = (str: string) =>
  str.replace(/\s+/g, ' ').trim().toLowerCase();

  const matches = rows
    .map((row, index) => ({ row, index: index + 2 })) // add 2 to get actual sheet row index
    .filter(({ row }) => row.length >= 3)
    .filter(({ row }) =>
      normalize(row[0]) === normalize(bank) &&
      normalize(row[1]) === normalize(segment)
      
    )
    .map(({ row, index }) => ({
      originalQuery: (row[2] || '').replace(/^"+|"+$/g, '').replace(/""/g, '"'),
      rowIndex: index
    }));
  console.log("Matched rows:", matches.length);
  return NextResponse.json(matches);
}
