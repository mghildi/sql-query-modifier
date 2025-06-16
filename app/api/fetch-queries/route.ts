// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server'
import { google }       from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!

// Create a GoogleAuth instance using your service-account credentials
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

  // Fetch the “Submissions” sheet
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })

  const rows = resp.data.values ?? []
  // Filter only approved & map to { originalQuery }
  const approved = rows
    .slice(1)
    .filter((r) => r[4] === 'Approved')      // column 4 = Status
    .map((r) => ({ originalQuery: r[1] || '' })) // column 1 = query

  return NextResponse.json(approved)
}
