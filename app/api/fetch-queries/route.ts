// app/api/fetch-queries/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'

const spreadsheetId = process.env.SHEET_ID!

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  // cast to OAuth2Client so google.sheets() accepts it
  const client = (await auth.getClient()) as OAuth2Client
  const sheets = google.sheets({ version: 'v4', auth: client })

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })

  // ...process resp.data.values as before...
  return NextResponse.json(/* ... */)
}
