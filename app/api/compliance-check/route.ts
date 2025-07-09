import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
    const { query } = await req.json()

    const systemPrompt = `
You are a MYSQL expert tasked with checking MYSQL queries.
Highlight possible SQL errors that can prevent execution.
Return your answer as Markdown bullet points using '- ' prefix.
Use one or two or three word heading for each bullet point and then provide short explanation.
Use separate lines for multiple points. Keep it concise.
`.trim()

    const payload = {
        model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `SQL:\n${query.trim()}` }
        ],
        temperature: 0.0,
        max_tokens: 256
    }

    try {
        const res = await axios.post(
            'https://api.deepinfra.com/v1/openai/chat/completions',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        const line = res.data.choices?.[0]?.message?.content?.trim()
        if (!line) throw new Error('Empty LLM response')

        return NextResponse.json({ result: line })
    } catch (err: any) {
        console.error('Compliance Check Error:', err.response?.data || err.message)
        return NextResponse.json(
            { error: err.message || 'Unknown error' },
            { status: 500 }
        )
    }
}
