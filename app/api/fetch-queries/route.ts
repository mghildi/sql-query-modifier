import { NextResponse } from 'next/server'
import { google }    from 'googleapis'

const spreadsheetId = process.env.SHEET_ID!

// Decode & parse the whole JSON creds:
const keyJson = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY_JSON_B64!, 'base64').toString()
)

const auth = new google.auth.GoogleAuth({
  credentials: keyJson,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export async function GET() {
  const client = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: client })
  const resp   = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Submissions!A:J',
  })
  /* … */
}
