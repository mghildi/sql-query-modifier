// app/review/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'sql-formatter'
import DiffMatchPatch from 'diff-match-patch'

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

export default function ReviewPage() {
  const [subs, setSubs] = useState<Submission[]>([])

  useEffect(() => {
    fetch('/api/fetch-submissions')
      .then(r => r.json())
      .then(data => setSubs(data))
      .catch(console.error)
  }, [])

  const uniqueBanks = Array.from(new Set(subs.map(s => s.BankName)))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Query Submissions</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['#','Original','Prompt','Modified','Status','By','Approved By','When','Bank','Segment'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-sm font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.rowIndex} className="border-t first:border-t-0 last:border-b">
                <td className="px-3 py-2">{s.rowIndex}</td>
                <td className="px-3 py-2">{s.OriginalQuery}</td>
                <td className="px-3 py-2">{s.Prompt || '-'}</td>
                <td className="px-3 py-2 whitespace-pre-wrap">{s.ModifiedQuery}</td>
                <td className="px-3 py-2">{s.Status}</td>
                <td className="px-3 py-2">{s.SubmittedBy}</td>
                <td className="px-3 py-2">{s.ApprovedBy || '-'}</td>
                <td className="px-3 py-2">{new Date(s.Timestamp).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <select defaultValue={s.BankName} className="border px-2 py-1 rounded">
                    {uniqueBanks.map(b => <option key={b}>{b}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">{s.Segment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
