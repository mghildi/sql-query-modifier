import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const { rowIndex, status } = await req.json();

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(fs.readFileSync('google-credentials.json', 'utf8')),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const sheet = 'Submissions';

    // Google Sheets is 1-based, so rowIndex 0 is header row
    const targetRange = `${sheet}!F${rowIndex + 2}`; // +2 to skip header

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating submission status:', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
