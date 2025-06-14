// File: app/api/fetch-queries/route.ts

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

export async function GET(req: Request) {
  try {
    // 1) Authenticate
    const svc  = loadServiceAccount();
    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 2) Parse query params
    const url     = new URL(req.url);
    const bank    = url.searchParams.get('bank')?.trim()   || '';
    const segment = url.searchParams.get('segment')?.trim() || '';

    // 3) Read Submissions sheet (columns A:I)
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const range         = 'Submissions!A2:I';
    const resp          = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows          = resp.data.values || [];

    // 4) Filter & map
    const filtered = rows
      .filter(r => r[7] === bank && r[8] === segment)
      .map(r => ({
        originalQuery:  r[0] || '',
        prompt:         r[1] || '',
        modifiedQuery:  r[2] || ''
      }));

    return NextResponse.json(filtered);
  } catch (err: any) {
    console.error('Error fetching queries:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
