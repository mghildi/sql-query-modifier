// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!

// Use GOOGLE_PRIVATE_KEY with literal newlines, not “\n” sequences
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // Pass the auth object directly — googleapis will call auth.getClient() under the hood
  const sheets = google.sheets({ version: 'v4', auth })

  // Read the “Submissions” sheet
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J', // adjust as needed
  })

  const rows = resp.data.values ?? []

  // Assuming:
  //   col 0 = rowIndex
  //   col 1 = originalQuery
  //   col 2 = prompt
  //   col 3 = modifiedQuery
  //   col 4 = status
  //   col 5 = submittedBy
  //   col 6 = approvedBy
  //   col 7 = timestamp
  //   col 8 = bankName
  //   col 9 = segment
  const submissions = rows.slice(1).map((r) => ({
    rowIndex: Number(r[0]),
    OriginalQuery: r[1] || '',
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
