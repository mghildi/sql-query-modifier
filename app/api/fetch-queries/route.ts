// app/api/fetch-queries/route.ts
import type { OAuth2Client }    from 'google-auth-library'
import { google }               from 'googleapis'
import { NextResponse }         from 'next/server'

const spreadsheetId = process.env.SHEET_ID!

// Use GOOGLE_PRIVATE_KEY with real newlines
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // 1. Get an OAuth2Client instance
  const client = (await auth.getClient()) as OAuth2Client

  // 2. Pass it to google.sheets() so TS matches the overload
  const sheets = google.sheets({ version: 'v4', auth: client })

  // 3. Read your "Submissions" sheet
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })

  // 4. Return only the approved queries
  const rows = resp.data.values ?? []
  const approved = rows
    .slice(1)
    .filter((r) => r[4] === 'Approved')     // assuming col 4 is Status
    .map((r) => ({ originalQuery: r[1] || '' })) // col 1 is the query

  return NextResponse.json(approved)
}
