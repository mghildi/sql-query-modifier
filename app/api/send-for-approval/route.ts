// app/api/send-for-approval/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { originalQuery, prompt, modifiedQuery, submittedBy, bank, segment } = await req.json();

    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'google-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM';
    const values = [[
      originalQuery,
      prompt,
      modifiedQuery,
      'Pending',
      submittedBy,
      '', // ApprovedBy
      new Date().toISOString(),
      bank,
      segment
    ]];  

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Submissions!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return NextResponse.json({ status: 'submitted' });
  } catch (error) {
    console.error('Error in send-for-approval API:', error);
    return NextResponse.json({ error: `Failed to submit: ${error.message}` }, { status: 500 });
  }
}
