import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  const { originalQuery, prompt } = await req.json();

  const instruction = `You are an expert SQL query engineer. Modify the following query based on this instruction: "${prompt}". Return only the updated SQL query, no extra text.`;

  try {
    const response = await axios.post(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        messages: [
          { role: 'system', content: 'You rewrite SQL queries based on user prompts.' },
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
    );

    const modifiedQuery = response?.data?.choices?.[0]?.message?.content?.trim();
    if (!modifiedQuery) {
      throw new Error('LLM returned an empty or malformed response');
    }

    return NextResponse.json({ modifiedQuery });
  } catch (err: any) {
    console.error('DeepInfra API Error:', err.response?.data || err.message);
    return NextResponse.json({ error: 'Failed to modify query' }, { status: 500 });
  }
}
