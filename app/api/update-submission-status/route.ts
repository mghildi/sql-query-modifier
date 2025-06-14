// File: app/api/update-submission-status/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

// === Shared helper to decode Base64‐encoded service account JSON ===
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
    const { rowIndex, status } = await req.json();
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const sheetName     = 'Submissions';

    // === Authenticate using the Base64 helper ===
    const svc  = loadServiceAccount();
    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Compute the A1 notation for the “Status” column (F) of the target row
    // If your data starts at row 2, you add 2 to a zero-based index
    const targetCell = `${sheetName}!F${rowIndex + 2}`;

    // Update just that one cell
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetCell,
      valueInputOption: 'RAW',
      requestBody: { values: [[ status ]] },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating submission status:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
