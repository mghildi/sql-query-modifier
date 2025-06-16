// app/api/fetch-queries/route.ts
import type { OAuth2Client } from 'google-auth-library'
import { google }            from 'googleapis'
import { NextResponse }      from 'next/server'

const spreadsheetId = process.env.SHEET_ID!

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // 1. Tell TS “trust me, this is an OAuth2Client”
  const client = (await auth.getClient()) as OAuth2Client

  // 2. Now google.sheets() accepts our client
  const sheets = google.sheets({ version: 'v4', auth: client })

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })

  const rows = resp.data.values ?? []
  const approved = rows
    .slice(1)
    .filter((r) => r[5] === 'Approved')
    .map((r) => ({ originalQuery: r[1] || '' }))

  return NextResponse.json(approved)
}
