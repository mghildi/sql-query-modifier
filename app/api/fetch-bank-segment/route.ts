import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

function loadServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_KEY_JSON_B64;
  if (!b64) throw new Error('Missing env var GOOGLE_SERVICE_KEY_JSON_B64');
  const raw = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(raw) as { private_key: string; client_email: string; [key: string]: any };
}

export async function GET() {
  try {
    const svc = loadServiceAccount();
    svc.private_key = svc.private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SHEET_ID!;
    const range = 'Sheet1!A2:B';
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = resp.data.values || [];

    const bankNames = Array.from(new Set(rows.map(r => r[0]).filter(Boolean)));
    const segmentMapping = rows
      .filter(r => r[0] && r[1])
      .map(r => ({ bank: r[0] as string, segment: r[1] as string }));

    return NextResponse.json({ bankNames, segmentMapping });
  } catch (err: any) {
    console.error('Error fetching bank/segment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
