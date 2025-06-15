// app/api/modify-query/route.ts
import { NextResponse } from 'next/server'
import axios from 'axios'
import { Buffer } from 'buffer'

// helper to decode Base64 JSON
function loadServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_KEY_JSON_B64
  if (!b64) throw new Error('Missing env var GOOGLE_SERVICE_KEY_JSON_B64')
  const raw = Buffer.from(b64, 'base64').toString('utf8')
  const svc = JSON.parse(raw) as any
  svc.private_key = svc.private_key.replace(/\\n/g, '\n')
  return svc
}

export async function POST(req: Request) {
  const { originalQuery, prompt } = await req.json()

  const instruction = `Modify this SQL query based on: "${prompt}". Return only the updated query.`

  try {
    // no more JSON.parse on GOOGLE_SERVICE_KEY_JSON
    const svc = loadServiceAccount()

    // if you ever need to call Google APIs here, use svc,
    // but since this route talks only to DeepInfra we don't actually use svc.
    // If you do need GoogleAuth, you can:
    // const auth = new google.auth.GoogleAuth({ credentials: svc, scopes: [...] })

    const res = await axios.post(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        messages: [
          { role: 'system', content: 'You rewrite SQL queries.' },
          { role: 'user', content: `${instruction}\nOriginal Query:\n${originalQuery}` },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const modifiedQuery = res.data.choices?.[0]?.message?.content?.trim()
    if (!modifiedQuery) throw new Error('Empty LLM response')

    return NextResponse.json({ modifiedQuery })
  } catch (err: any) {
    console.error('DeepInfra API Error:', err.response?.data || err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
