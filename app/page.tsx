// app/page.tsx
import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'

// shape of a submission row
interface Submission {
  rowIndex: number
  OriginalQuery: string
  Prompt: string
  ModifiedQuery: string
  Status: string
  SubmittedBy: string
  ApprovedBy: string
  Timestamp: string
  BankName: string
  Segment: string
}

// fetch all submissions
async function getSubmissions(): Promise<Submission[]> {
  const hdrs = await headers()
  const host = hdrs.get('host')!
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const res = await fetch(`${protocol}://${host}/api/fetch-submissions`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load submissions')
  return res.json()
}

export default async function Home() {
  const submissions = await getSubmissions()

  // gather unique bank names for the dropdown
  const uniqueBanks = Array.from(new Set(submissions.map((s) => s.BankName)))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Query Submissions</h1>
        <Link href="/review">
          <button className="bg-blue-600 text-white px-3 py-1 rounded">
            Go to Review
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 text-left text-sm font-medium">#</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Original</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Prompt</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Modified</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Status</th>
              <th className="px-3 py-2 text-left text-sm font-medium">By</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Approved By</th>
              <th className="px-3 py-2 text-left text-sm font-medium">When</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Bank</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Segment</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.rowIndex} className="border-t first:border-t-0 last:border-b">
                <td className="px-3 py-2 align-top">{s.rowIndex}</td>
                <td className="px-3 py-2 align-top">{s.OriginalQuery}</td>
                <td className="px-3 py-2 align-top">{s.Prompt || '-'}</td>
                <td className="px-3 py-2 align-top">
                  <pre className="whitespace-pre-wrap m-0">{s.ModifiedQuery}</pre>
                </td>
                <td className="px-3 py-2 align-top">{s.Status}</td>
                <td className="px-3 py-2 align-top">{s.SubmittedBy}</td>
                <td className="px-3 py-2 align-top">{s.ApprovedBy || '-'}</td>
                <td className="px-3 py-2 align-top">
                  {new Date(s.Timestamp).toLocaleString()}
                </td>
                <td className="px-3 py-2 align-top">
                  <select defaultValue={s.BankName} className="border px-2 py-1 rounded">
                    {uniqueBanks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 align-top">{s.Segment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
