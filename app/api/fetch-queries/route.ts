// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server'
import { google }       from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!

// Use a GoogleAuth instance (with literal newlines in your key)
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // 1️⃣ Pass the GoogleAuth instance directly as `auth`
  const sheets = google.sheets({ version: 'v4', auth })

  // 2️⃣ Fetch the sheet
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })

  // 3️⃣ Pull out the rows (skip header row)
  const rows = resp.data.values ?? []

  // 4️⃣ Filter only “Approved” rows and map to approvedQuery objects
  const approved = rows
    .slice(1)
    .filter(r => r[4] === 'Approved')        // column 4 = Status
    .map(r => ({ originalQuery: r[1] || '' })) // column 1 = the SQL text

  // 5️⃣ Return JSON
  return NextResponse.json(approved)
}
