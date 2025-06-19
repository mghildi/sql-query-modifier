'use client';

import { useState, useEffect, useRef } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';
import Link from 'next/link';

export default function SubmissionsPage() {
  // === state for users/banks/segments/queries/...
  const [user, setUser] = useState('Mohit');
  const [customUser, setCustomUser] = useState('');
  const [bankList, setBankList] = useState<string[]>([]);
  const [segmentList, setSegmentList] = useState<string[]>([]);
  const [queries, setQueries] = useState<{ originalQuery: string }[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedQuery, setSelectedQuery] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  // ... plus your modifiedQuery, editableQuery, diff, loading, etc.

  // load bankList from `/api/fetch-bank-segment` on mount
  useEffect(() => { /* same as before */ }, []);

  // when bank selected, load segmentList
  useEffect(() => { /* same as before */ }, [selectedBank]);

  // when segment selected, load approved queries
  useEffect(() => { /* same as before */ }, [selectedSegment]);

  // your handlers: handleGenerate, handleFinalSubmit, handleSendForApproval…

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">SQL Query Modifier</h1>
        <Link href="/review">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Go to Review</button>
        </Link>
      </div>

      {/* --- User selector --- */}
      <label>Your name:</label>
      <select value={user} onChange={e => setUser(e.target.value)} className="mb-4">
        <option>Mohit</option><option>Bhaskar</option><option>Prerna</option><option>Others</option>
      </select>
      {user === 'Others' && <input value={customUser} onChange={e => setCustomUser(e.target.value)} placeholder="Enter name"/>}

      {/* --- Bank buttons --- */}
      <div className="mb-4 space-x-2">
        {bankList.map(b => (
          <button key={b} onClick={() => setSelectedBank(b)} className={b===selectedBank?'bg-blue-500':'bg-gray-200'}>
            {b}
          </button>
        ))}
      </div>

      {/* --- Segment buttons --- */}
      {segmentList.length > 0 && (
        <div className="mb-4 space-x-2">
          {segmentList.map(s => (
            <button key={s} onClick={() => setSelectedSegment(s)} className={s===selectedSegment?'bg-blue-500':'bg-gray-200'}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* --- Approved query dropdown --- */}
      <label>Pick an approved query:</label>
      <select value={selectedQuery} onChange={e => setSelectedQuery(e.target.value)} className="mb-4 w-full">
        <option value="">-- none --</option>
        {queries.map((q,i) => <option key={i} value={q.originalQuery}>{q.originalQuery}</option>)}
      </select>

      {/* --- Or custom query --- */}
      <label>Or paste your own SQL:</label>
      <textarea value={customQuery} onChange={e => setCustomQuery(e.target.value)} className="mb-4 w-full h-20"/>

      {/* --- Prompt --- */}
      <label>Instruction / Prompt:</label>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="mb-4 w-full h-20"/>

      {/* --- Generate button etc. --- */}
      {/* ... */}
    </div>
  );
}
