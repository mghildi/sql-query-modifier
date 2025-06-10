import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(fs.readFileSync('google-credentials.json', 'utf8')),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM'; // ✅ Your spreadsheet ID
    const range = 'Sheet1!A2:B'; // ✅ BankName in A, Segment in B

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    const bankNames = [...new Set(rows.map(row => row[0]))];
    const segmentMapping = rows.map(row => ({
      bank: row[0],
      segment: row[1],
    }));

    return NextResponse.json({ bankNames, segmentMapping });
  } catch (err) {
    console.error('Error fetching bank-segment:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
