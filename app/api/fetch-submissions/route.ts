// app/api/fetch-submissions/route.ts
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

// Optional: sanity-check on startup
const B64 = process.env.GOOGLE_SERVICE_KEY_JSON_B64
console.log(
  '🔑 GOOGLE_SERVICE_KEY_JSON_B64 length:',
  B64?.length,
  'first 10 chars:',
  B64?.slice(0, 10)
)

function loadServiceAccount() {
  if (!B64) {
    throw new Error('Missing env var: GOOGLE_SERVICE_KEY_JSON_B64')
  }
  // 1) Decode from base64 → UTF-8 JSON string
  const raw = Buffer.from(B64, 'base64').toString('utf8')
  // 2) Parse into an object
  const svc = JSON.parse(raw) as {
    private_key: string
    client_email: string
    [key: string]: any
  }
  // 3) No need to replace \\n now — they’re real newlines
  return svc
}

export async function GET() {
  try {
    const serviceAccount = loadServiceAccount()

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = '1GwTyj7g0pbqyvwBiWbUXHi_J1qboJ2rryXgCXtpnvLM'
    const range = 'Submissions!A2:I'
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const rows = resp.data.values || []

    const submissions = rows.map((row, i) => ({
      rowIndex:      i + 2,
      OriginalQuery: row[0] || '',
      Prompt:        row[1] || '',
      ModifiedQuery: row[2] || '',
      Status:        row[3] || '',
      SubmittedBy:   row[4] || '',
      ApprovedBy:    row[5] || '',
      Timestamp:     row[6] || '',
      BankName:      row[7] || '',
      Segment:       row[8] || '',
    }))

    return NextResponse.json(submissions)
  } catch (e: any) {
    console.error('Error fetching submissions:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
