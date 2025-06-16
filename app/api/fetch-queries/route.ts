// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server'
import { google }       from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!

// Build a GoogleAuth instance with your service-account creds
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Replace literal “\n” sequences with real newlines
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // Pass the GoogleAuth instance directly
  const sheets = google.sheets({ version: 'v4', auth })

  // Read the “Submissions” sheet
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })

  const rows = resp.data.values ?? []
  // Map out only the “Approved” rows into approved queries
  const approved = rows
    .slice(1)
    .filter(r => r[4] === 'Approved')        // column 4 is Status
    .map(r => ({ originalQuery: r[1] || '' })) // column 1 is the query text

  return NextResponse.json(approved)
}
