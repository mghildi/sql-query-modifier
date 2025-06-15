// app/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import DiffMatchPatch from 'diff-match-patch'
import { format } from 'sql-formatter'

// (You’ll need to re-import any hooks + state you already wrote for
//  bankList/segmentList/approved queries/etc. This skeleton just shows
//  the shell + View Submissions button.)

export default function HomePage() {
  // ───────────────────────────────────────────────────────────────
  // YOUR EXISTING SQL‐BUILDER STATE & LOGIC GOES HERE
  //
  // const [bankList]      = useState<string[]>([])
  // const [selectedBank]  = useState<string>('')
  // const [segmentList]   = useState<string[]>([])
  // const [selectedQuery] = useState<string>('')
  // const [customQuery]   = useState<string>('')
  // const [prompt, setPrompt] = useState('')
  // const [modifiedQuery, setModifiedQuery] = useState('')
  // const [editableQuery, setEditableQuery] = useState('')
  // const [loading, setLoading]         = useState(false)
  // const [formatOnly, setFormatOnly]   = useState(false)
  // const editRef = useRef<HTMLTextAreaElement>(null)
  //
  // useEffect(() => { fetch banks & segments… }, [])
  // useEffect(() => { fetch approved queries when bank+segment change }, [selectedBank, selectedSegment])
  // function handleGenerate() { … }
  // function handleFinalSubmit() { … }
  // function handleSendForApproval() { … }
  // ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">SQL Query Modifier</h1>
        <Link href="/submissions">
          <button className="bg-blue-600 text-white px-3 py-1 rounded">
            View Submissions
          </button>
        </Link>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* HERE: your builder form goes in place of the comment below */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 
        <div> Select user… </div>
        <div> Bank dropdown… </div>
        <div> Segment dropdown… </div>
        <div> Approved queries dropdown… </div>
        <div> Or paste custom SQL… </div>
        <div> Prompt textarea… </div>
        <div> Format-only checkbox… </div>
        <button onClick={handleGenerate}>Generate Modified Query</button>
        {modifiedQuery && (
          <textarea ref={editRef} value={editableQuery} onChange={…} />
          <button onClick={handleFinalSubmit}>Show Diff</button>
          <button onClick={handleSendForApproval}>Send for Approval</button>
        )}
        {finalDiff && <div dangerouslySetInnerHTML={{ __html: finalDiff }} />}
      */}
    </div>
  )
}
