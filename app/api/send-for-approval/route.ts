// File: app/api/send-for-approval/route.ts

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
    const {
      originalQuery,
      prompt,
      modifiedQuery,
      submittedBy,
      bank,
      segment,
    } = await req.json();

    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';

    // === Authenticate with Google using Base64 creds ===
    const svc  = loadServiceAccount();
    const auth = new google.auth.GoogleAuth({
      credentials: svc,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Build the new submission row
    const values = [[
      originalQuery,
      prompt,
      modifiedQuery,
      'Pending',         // Status
      submittedBy,       // SubmittedBy
      '',                // ApprovedBy (blank until review)
      new Date().toISOString(),
      bank,
      segment,
    ]];

    // Append into Submissions!A2:I
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Submissions!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return NextResponse.json({ status: 'submitted' });
  } catch (err: any) {
    console.error('Error in send-for-approval API:', err);
    return NextResponse.json(
      { error: `Failed to submit: ${err.message}` },
      { status: 500 }
    );
  }
}
