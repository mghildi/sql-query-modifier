// File: /app/api/fetch-submissions/route.ts or /pages/api/fetch-submissions.ts
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
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const range = 'Submissions!A2:H';

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = response.data.values || [];

    const submissions = rows.map((row, i) => ({
      rowIndex: i + 2,
      bank: row[0],
      segment: row[1],
      originalQuery: row[2],
      prompt: row[3],
      modifiedQuery: row[4],
      status: row[5],
      submittedBy: row[6],
      timestamp: row[7],
    }));

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
