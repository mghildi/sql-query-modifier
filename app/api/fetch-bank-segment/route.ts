import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

// Helper to decode and parse the service-account JSON from ENV
function loadServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_KEY_JSON_B64;
  if (!b64) throw new Error('Missing env var GOOGLE_SERVICE_KEY_JSON_B64');
  const raw = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(raw) as { private_key: string; client_email: string; [key: string]: any };
}

export async function GET() {
  try {
    // Load and fix the service account credentials
    const svc = loadServiceAccount();
    svc.private_key = svc.private_key.replace(/\\n/g, '\n');

    // Authenticate with Google
    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read master bank/segment data from Sheet1
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const range = 'Sheet1!A2:B';
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = resp.data.values || [];

    // Extract unique bank names and build mapping
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
