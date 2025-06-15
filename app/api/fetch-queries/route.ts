// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!

// Use GOOGLE_PRIVATE_KEY with actual newlines, not literal “\n” sequences
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // Pass the auth instance directly—googleapis handles getClient() internally
  const sheets = google.sheets({ version: 'v4', auth })

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J', // adjust if your sheet layout differs
  })

  const rows = resp.data.values ?? []

  // Map each row into your Submission shape
  const submissions = rows.slice(1).map((r) => ({
    rowIndex:     Number(r[0]),
    OriginalQuery:r[1] || '',
    Prompt:       r[2] || '',
    ModifiedQuery:r[3] || '',
    Status:       r[4] || '',
    SubmittedBy:  r[5] || '',
    ApprovedBy:   r[6] || '',
    Timestamp:    r[7] || '',
    BankName:     r[8] || '',
    Segment:      r[9] || '',
  }))

  return NextResponse.json(submissions)
}
