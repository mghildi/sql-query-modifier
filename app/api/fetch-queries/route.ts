import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  const client = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: client })
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J', // adjust if your sheet layout differs
  })
  const rows = resp.data.values?.slice(1) || []
  // assuming column 5 (zero-based) is “Status” and column 1 is the originalQuery:
  const approved = rows
    .filter((r) => r[5] === 'Approved')
    .map((r) => ({ originalQuery: r[1] }))

  return NextResponse.json(approved)
}
