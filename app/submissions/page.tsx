'use client'

import React, { useState, useEffect, useRef } from 'react'
import DiffMatchPatch from 'diff-match-patch'
import Link from 'next/link'
import { format } from 'sql-formatter'

// shape of an approved query
interface ApprovedQuery {
  originalQuery: string
}

export default function SubmissionsPage() {
  const [queries, setQueries] = useState<ApprovedQuery[]>([])
  const [selectedQuery, setSelectedQuery] = useState('')
  const [customQuery, setCustomQuery] = useState('')
  const [prompt, setPrompt] = useState('')
  const [modifiedQuery, setModifiedQuery] = useState('')
  const [editableQuery, setEditableQuery] = useState('')
  const [finalDiff, setFinalDiff] = useState('')
  const [loading, setLoading] = useState(false)
  const [formatOnly, setFormatOnly] = useState(false)
  const editBoxRef = useRef<HTMLTextAreaElement>(null)

  // fetch approved queries on mount
  useEffect(() => {
    fetch('/api/fetch-queries')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setQueries(data))
      .catch(console.error)
  }, [])

  const getBaseQuery = () => (customQuery.trim() !== '' ? customQuery : selectedQuery)

  const autoResize = () => {
    if (editBoxRef.current) {
      editBoxRef.current.style.height = 'auto'
      editBoxRef.current.style.height = editBoxRef.current.scrollHeight + 'px'
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setFinalDiff('')
    const original = getBaseQuery().trim()
    try {
      if (formatOnly) {
        const fmt = format(original)
        setModifiedQuery(fmt)
        setEditableQuery(fmt)
      } else {
        const res = await fetch('/api/modify-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalQuery: original, prompt }),
        })
        const { modifiedQuery: mod = '' } = await res.json()
        const fmt = format(mod)
        setModifiedQuery(fmt)
        setEditableQuery(fmt)
      }
    } catch {
      setModifiedQuery('Error contacting API')
      setEditableQuery('')
    } finally {
      setLoading(false)
    }
  }

  const handleShowDiff = () => {
    const orig = getBaseQuery().replace(/\s+/g, ' ').trim()
    const dmp = new DiffMatchPatch()
    const diff = dmp.diff_main(orig, editableQuery.replace(/\s+/g, ' ').trim())
    dmp.diff_cleanupSemantic(diff)

    // ← Here’s the explicit tuple annotation:
    const html = diff
      .map(([t, txt]: [number, string]) =>
        t === DiffMatchPatch.DIFF_INSERT
          ? `<b>${txt}</b>`
          : t === DiffMatchPatch.DIFF_DELETE
          ? `<del>${txt}</del>`
          : txt
      )
      .join('')

    setFinalDiff(html)
  }

  const handleSendForApproval = async () => {
    try {
      const res = await fetch('/api/send-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuery: getBaseQuery(),
          prompt,
          modifiedQuery: editableQuery,
          submittedBy: 'You',
        }),
      })
      const { status } = await res.json()
      alert(status === 'submitted' ? 'Submitted!' : 'Failed.')
    } catch {
      alert('Error submitting!')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SQL Query Modifier</h1>
        <Link href="/">
          <button className="bg-blue-600 text-white px-3 py-1 rounded">
            Home
          </button>
        </Link>
      </div>

      <div className="mb-4">
        <label className="font-semibold">Pick an approved query:</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedQuery}
          onChange={(e) => setSelectedQuery(e.target.value)}
        >
          <option value="">-- none --</option>
          {queries.map((q, i) => (
            <option key={i} value={q.originalQuery}>
              {q.originalQuery}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="font-semibold">Or paste your own SQL:</label>
        <textarea
          className="border p-2 rounded w-full h-24"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">Instruction / Prompt:</label>
        <textarea
          className="border p-2 rounded w-full h-24"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={formatOnly}
          onChange={(e) => setFormatOnly(e.target.checked)}
          className="mr-2"
        />
        Only format (no changes)
      </label>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Working…' : 'Generate Modified Query'}
      </button>

      {modifiedQuery && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Edit Your Modified Query</h2>
          <textarea
            ref={editBoxRef}
            className="border p-2 rounded w-full resize-none overflow-hidden"
            value={editableQuery}
            onChange={(e) => {
              setEditableQuery(e.target.value)
              autoResize()
            }}
            onInput={autoResize}
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleShowDiff}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Show Diff
            </button>
            <button
              onClick={handleSendForApproval}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Send for Approval
            </button>
          </div>
        </div>
      )}

      {finalDiff && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Highlighted Changes</h2>
          <div
            className="bg-gray-100 p-4 rounded whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: finalDiff }}
          />
        </div>
      )}
    </div>
  )
}
