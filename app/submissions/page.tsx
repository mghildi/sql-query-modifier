// app/submissions/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import DiffMatchPatch from 'diff-match-patch'
import { format } from 'sql-formatter'

export default function SubmissionsForm() {
  // — Queries & selection —
  const [queries, setQueries] = useState<{ originalQuery: string }[]>([])
  const [selectedQuery, setSelectedQuery] = useState('')
  const [customQuery, setCustomQuery] = useState('')

  // — LLM/formatted state —
  const [prompt, setPrompt] = useState('')
  const [modifiedQuery, setModifiedQuery] = useState('')
  const [editableQuery, setEditableQuery] = useState('')
  const [finalDiff, setFinalDiff] = useState('')
  const [loading, setLoading] = useState(false)
  const [formatOnly, setFormatOnly] = useState(false)
  const editBoxRef = useRef<HTMLTextAreaElement>(null)

  // — User metadata —
  const [user, setUser] = useState('Mohit')
  const [customUser, setCustomUser] = useState('')

  // — Bank & segment dropdowns —
  const [bankList, setBankList] = useState<string[]>([])
  const [fullSegmentList, setFullSegmentList] = useState<{ bank: string; segment: string }[]>([])
  const [filteredSegmentList, setFilteredSegmentList] = useState<string[]>([])
  const [selectedBank, setSelectedBank] = useState('')
  const [customBank, setCustomBank] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [customSegment, setCustomSegment] = useState('')

  // Fetch banks + segments once
  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(r => r.json())
      .then(data => {
        setBankList(data.bankNames || [])
        setFullSegmentList(data.segmentMapping || [])
      })
  }, [])

  // Re-filter segments when bank changes
  useEffect(() => {
    if (selectedBank && selectedBank !== 'Others') {
      const segs = fullSegmentList
        .filter(x => x.bank === selectedBank)
        .map(x => x.segment)
      setFilteredSegmentList(Array.from(new Set(segs)))
    } else {
      setFilteredSegmentList([])
    }
    setSelectedSegment('')
    setQueries([])
  }, [selectedBank, fullSegmentList])

  // Fetch approved queries when bank+segment ready
  useEffect(() => {
    const bankToSend = selectedBank === 'Others' ? customBank : selectedBank
    const segToSend = selectedSegment === 'Others' ? customSegment : selectedSegment
    if (bankToSend && segToSend) {
      fetch(`/api/fetch-queries?bank=${encodeURIComponent(bankToSend)}&segment=${encodeURIComponent(segToSend)}`)
        .then(r => r.json())
        .then(data => setQueries(Array.isArray(data) ? data : []))
        .catch(() => setQueries([]))
    }
  }, [selectedBank, selectedSegment, customBank, customSegment])

  // Helpers
  const getBaseQuery = () => customQuery.trim() !== '' ? customQuery : selectedQuery
  const autoResize = () => {
    if (editBoxRef.current) {
      editBoxRef.current.style.height = 'auto'
      editBoxRef.current.style.height = editBoxRef.current.scrollHeight + 'px'
    }
  }

  // Generate / format
  const handleGenerate = async () => {
    setLoading(true)
    setFinalDiff('')
    const original = getBaseQuery()
    try {
      if (formatOnly) {
        const f = format(original)
        setModifiedQuery(f)
        setEditableQuery(f)
      } else {
        const res = await fetch('/api/modify-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalQuery: original, prompt }),
        })
        const { modifiedQuery: m = '' } = await res.json()
        const f = format(m)
        setModifiedQuery(f)
        setEditableQuery(f)
      }
    } catch {
      setModifiedQuery('Error contacting API')
    } finally {
      setLoading(false)
    }
  }

  // Highlight diff
  const handleFinalSubmit = () => {
    const orig = getBaseQuery().replace(/\s+/g, ' ').trim()
    const newQ = editableQuery.replace(/\s+/g, ' ').trim()
    const dmp = new DiffMatchPatch()
    const diff = dmp.diff_main(orig, newQ)
    dmp.diff_cleanupSemantic(diff)
    setFinalDiff(diff.map(([t, txt]) =>
      t === DiffMatchPatch.DIFF_INSERT ? `<b>${txt}</b>` :
      t === DiffMatchPatch.DIFF_DELETE ? `<del>${txt}</del>` :
      txt
    ).join(''))
  }

  // Send for approval
  const handleSendForApproval = async () => {
    const submittedBy = user === 'Others' ? customUser.trim() || 'Unknown' : user
    try {
      const res = await fetch('/api/send-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuery: getBaseQuery(),
          prompt,
          modifiedQuery: editableQuery,
          submittedBy,
          bank: selectedBank === 'Others' ? customBank : selectedBank,
          segment: selectedSegment === 'Others' ? customSegment : selectedSegment,
        }),
      })
      const { status } = await res.json()
      alert(status === 'submitted' ? 'Submitted!' : 'Failed.')
    } catch {
      alert('Error!')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SQL Query Modifier</h1>

      {/* User */}
      <div className="mb-4">
        <label className="font-semibold">Select User:</label>
        <select value={user} onChange={e => setUser(e.target.value)} className="w-full p-2 border mb-2">
          <option>Mohit</option><option>Bhaskar</option><option>Prerna</option><option>Others</option>
        </select>
        {user === 'Others' && (
          <input
            type="text"
            placeholder="Enter your name"
            value={customUser}
            onChange={e => setCustomUser(e.target.value)}
            className="w-full p-2 border"
          />
        )}
      </div>

      {/* Bank */}
      <div className="mb-4">
        <label className="font-semibold">Select Bank Name:</label>
        <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className="w-full p-2 border">
          <option value="">-- Select Bank --</option>
          {bankList.map((b,i) => <option key={i} value={b}>{b}</option>)}
          <option>Others</option>
        </select>
        {selectedBank === 'Others' && (
          <input
            type="text"
            placeholder="Enter custom bank"
            value={customBank}
            onChange={e => setCustomBank(e.target.value)}
            className="w-full p-2 border mt-2"
          />
        )}
      </div>

      {/* Segment */}
      <div className="mb-4">
        <label className="font-semibold">Select Segment:</label>
        <select value={selectedSegment} onChange={e => setSelectedSegment(e.target.value)} className="w-full p-2 border">
          <option value="">-- Select Segment --</option>
          {filteredSegmentList.map((s,i) => <option key={i} value={s}>{s}</option>)}
          <option>Others</option>
        </select>
        {selectedSegment === 'Others' && (
          <input
            type="text"
            placeholder="Enter custom segment"
            value={customSegment}
            onChange={e => setCustomSegment(e.target.value)}
            className="w-full p-2 border mt-2"
          />
        )}
      </div>

      {/* Approved queries */}
      <label className="font-semibold">Select an approved query:</label>
      <select onChange={e => setSelectedQuery(e.target.value)} className="w-full mb-4 p-2 border">
        <option value="">-- Select Approved Query --</option>
        {queries.length > 0
          ? queries.map((q,i) => <option key={i} value={q.originalQuery}>{q.originalQuery}</option>)
          : <option disabled>No approved queries</option>
        }
      </select>

      {/* Or paste */}
      <label className="font-semibold">Or paste your own query:</label>
      <textarea
        className="w-full mb-4 p-2 border h-24"
        placeholder="Paste your SQL query here…"
        value={customQuery}
        onChange={e => setCustomQuery(e.target.value)}
      />

      {/* Prompt */}
      <label className="font-semibold">Instruction / Prompt:</label>
      <textarea
        className="w-full mb-4 p-2 border h-24"
        placeholder="E.g. “Only select name and email.”"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      {/* Format only */}
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={formatOnly}
          onChange={e => setFormatOnly(e.target.checked)}
          className="mr-2"
        />
        Only format (no changes)
      </label>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        {loading ? 'Working…' : 'Generate Modified Query'}
      </button>

      {/* Editable */}
      {modifiedQuery && (
        <div>
          <h2 className="font-semibold mb-2">Edit Your Modified Query</h2>
          <textarea
            ref={editBoxRef}
            value={editableQuery}
            onChange={e => { setEditableQuery(e.target.value); autoResize() }}
            onInput={autoResize}
            className="w-full p-2 border resize-none overflow-hidden"
          />
          <div className="flex gap-4 mt-3">
            <button onClick={handleFinalSubmit} className="bg-blue-600 text-white px-3 py-1 rounded">
              Show Diff
            </button>
            <button onClick={handleSendForApproval} className="bg-yellow-500 text-white px-3 py-1 rounded">
              Send for Approval
            </button>
          </div>
        </div>
      )}

      {/* Diff */}
      {finalDiff && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Highlighted Changes</h2>
          <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: finalDiff }} />
        </div>
      )}
    </div>
  )
}
