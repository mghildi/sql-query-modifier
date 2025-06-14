// app/api/modify-query/route.ts

import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
  const { originalQuery, prompt } = await req.json()

  const instruction = `Modify this SQL query based on: "${prompt}". Return only the updated query.`

  try {
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
