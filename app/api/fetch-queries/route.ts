// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!

// Use GOOGLE_PRIVATE_KEY with literal newlines
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // Pass the auth instance directly
  const sheets = google.sheets({ version: 'v4', auth })

  // Read the “Submissions” sheet
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })

  const rows = resp.data.values ?? []

  // Map to your Submission shape
  const approved = rows
    .slice(1)
    .filter((r) => r[4] === 'Approved')      // col 4 = Status
    .map((r) => ({ originalQuery: r[1] }))   // col 1 = OriginalQuery

  return NextResponse.json(approved)
}
