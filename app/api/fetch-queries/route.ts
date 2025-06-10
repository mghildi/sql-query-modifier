// /api/fetch-queries/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(req: Request) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(fs.readFileSync('google-credentials.json', 'utf8')),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const url = new URL(req.url);
    const bank = url.searchParams.get('bank')?.trim();
    const segment = url.searchParams.get('segment')?.trim();

    const range = 'Sheet1!A2:C'; // Bank Name, Segment, OriginalQuery

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    const filtered = rows.filter(row =>
      row[0]?.trim() === bank && row[1]?.trim() === segment
    ).map(row => ({
      originalQuery: row[2],
    }));

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Error fetching Sheet1 queries:', err);
    return NextResponse.json({ error: 'Failed to fetch queries' }, { status: 500 });
  }
}
