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

  const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A2:C',
  });

  const rows = resp.data.values ?? [];

  // ✅ Add these logs here
  console.log("✅ Received bank:", bank);
  console.log("✅ Received segment:", segment);
  console.log("✅ Sheet rows:", JSON.stringify(rows, null, 2));

  const matches = rows
    .filter(row => row.length >= 3)
    .filter(([b, s]) =>
      b?.trim().toLowerCase() === bank.toLowerCase() &&
      s?.trim().toLowerCase() === segment.toLowerCase()
    )
    .map(([, , sql]) => ({
      originalQuery: (sql || '')
        .replace(/^"+|"+$/g, '')
        .replace(/""/g, '"')
    }));

  console.log("✅ Matching queries:", matches);

  return NextResponse.json(matches);
}
