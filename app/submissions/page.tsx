// app/submissions/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';
import Link from 'next/link';

export default function SubmissionsPage() {
  // --- Data state ---
  const [bankList, setBankList] = useState<string[]>([]);
  const [fullSegmentList, setFullSegmentList] = useState<{ bank: string; segment: string }[]>([]);
  const [filteredSegments, setFilteredSegments] = useState<string[]>([]);
  const [queries, setQueries] = useState<{ originalQuery: string }[]>([]);

  // --- Selection state ---
  const [user, setUser] = useState('Mohit');
  const [customUser, setCustomUser] = useState('');
  const [bank, setBank] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [segment, setSegment] = useState('');
  const [customSegment, setCustomSegment] = useState('');
  const [selectedQuery, setSelectedQuery] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [formatOnly, setFormatOnly] = useState(false);

  // --- Editing & diff state ---
  const [modifiedQuery, setModifiedQuery] = useState('');
  const [editableQuery, setEditableQuery] = useState('');
  const [finalDiff, setFinalDiff] = useState('');
  const [loading, setLoading] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // --- Load bank/segment mapping on mount ---
  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(r => r.json())
      .then(d => {
        setBankList(d.bankNames || []);
        setFullSegmentList(d.segmentMapping || []);
      });
  }, []);

  // --- When bank changes, recompute segments ---
  useEffect(() => {
    const b = bank === 'Others' ? customBank.trim() : bank;
    if (b) {
      const segs = fullSegmentList
        .filter(x => x.bank === b)
        .map(x => x.segment);
      setFilteredSegments(Array.from(new Set(segs)));
    } else {
      setFilteredSegments([]);
    }
    setSegment('');
    setQueries([]);
  }, [bank, customBank, fullSegmentList]);

  // --- When bank+segment set, fetch approved queries ---
  useEffect(() => {
    const b = bank === 'Others' ? customBank.trim() : bank;
    const s = segment === 'Others' ? customSegment.trim() : segment;
    if (b && s) {
      fetch(`/api/fetch-queries?bank=${encodeURIComponent(b)}&segment=${encodeURIComponent(s)}`)
        .then(r => r.json())
        .then(d => setQueries(Array.isArray(d) ? d : []))
        .catch(() => setQueries([]));
    }
  }, [bank, customBank, segment, customSegment]);

  // --- Helpers ---
  const baseQuery = () => customQuery.trim() || selectedQuery;

  const autoResize = () => {
    if (editRef.current) {
      editRef.current.style.height = 'auto';
      editRef.current.style.height = editRef.current.scrollHeight + 'px';
    }
  };

  // --- Generate or format via API ---
  const handleGenerate = async () => {
    setLoading(true);
    setFinalDiff('');
    const orig = baseQuery();
    if (formatOnly) {
      const f = format(orig);
      setModifiedQuery(f);
      setEditableQuery(f);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/modify-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuery: orig, prompt }),
      });
      const { modifiedQuery: mod = '' } = await res.json();
      const f = format(mod || '');
      setModifiedQuery(f);
      setEditableQuery(f);
    } catch {
      setModifiedQuery('Error contacting LLM');
    } finally {
      setLoading(false);
    }
  };

  // --- Highlight diff & show final change before approval ---
  const handleFinal = () => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(baseQuery().replace(/\s+/g,' ').trim(), editableQuery.replace(/\s+/g,' ').trim());
    dmp.diff_cleanupSemantic(diff);
    const html = diff.map(([t,txt]: [number,string]) =>
      t === DiffMatchPatch.DIFF_INSERT
        ? `<b>${txt}</b>`
        : t === DiffMatchPatch.DIFF_DELETE
          ? `<del>${txt}</del>`
          : txt
    ).join('');
    setFinalDiff(html);
  };

  // --- Send into “Submissions” sheet for approval ---
  const handleSubmit = async () => {
    const approvedBy = user === 'Others' ? customUser.trim() || 'Unknown' : user;
    const payload = {
      originalQuery: baseQuery(),
      prompt,
      modifiedQuery: editableQuery,
      submittedBy: approvedBy,
      bank: bank === 'Others' ? customBank.trim() : bank,
      segment: segment === 'Others' ? customSegment.trim() : segment,
    };
    try {
      const r = await fetch('/api/send-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const { status } = await r.json();
      alert(status === 'submitted' ? 'Submitted!' : 'Failed');
    } catch {
      alert('Network error');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">SQL Query Modifier</h1>
        <Link href="/review">
          <button className="bg-blue-600 text-white px-3 py-1 rounded">Go to Review</button>
        </Link>
      </div>

      {/* User */}
      <div className="mb-4">
        <label className="font-semibold">Your name:</label>
        <select
          value={user}
          onChange={e => setUser(e.target.value)}
          className="w-full p-2 border mb-2"
        >
          {['Mohit','Bhaskar','Prerna','Others'].map(u => <option key={u}>{u}</option>)}
        </select>
        {user === 'Others' && (
          <input
            className="w-full p-2 border"
            placeholder="Enter name"
            value={customUser}
            onChange={e => setCustomUser(e.target.value)}
          />
        )}
      </div>

      {/* Bank */}
      <div className="mb-4">
        <label className="font-semibold">Select Bank:</label>
        <select
          value={bank}
          onChange={e => setBank(e.target.value)}
          className="w-full p-2 border"
        >
          <option value="">-- pick --</option>
          {bankList.map(b => <option key={b}>{b}</option>)}
          <option>Others</option>
        </select>
        {bank === 'Others' && (
          <input
            className="w-full p-2 border mt-2"
            placeholder="Custom Bank"
            value={customBank}
            onChange={e => setCustomBank(e.target.value)}
          />
        )}
      </div>

      {/* Segment */}
      <div className="mb-4">
        <label className="font-semibold">Select Segment:</label>
        <select
          value={segment}
          onChange={e => setSegment(e.target.value)}
          className="w-full p-2 border"
        >
          <option value="">-- pick --</option>
          {filteredSegments.map(s => <option key={s}>{s}</option>)}
          <option>Others</option>
        </select>
        {segment === 'Others' && (
          <input
            className="w-full p-2 border mt-2"
            placeholder="Custom Segment"
            value={customSegment}
            onChange={e => setCustomSegment(e.target.value)}
          />
        )}
      </div>

      {/* Approved Queries */}
      <div className="mb-4">
        <label className="font-semibold">Pick an approved query:</label>
        <select
          value={selectedQuery}
          onChange={e => setSelectedQuery(e.target.value)}
          className="w-full p-2 border"
        >
          <option value="">-- none --</option>
          {queries.map((q,i) => (
            <option key={i} value={q.originalQuery}>{q.originalQuery}</option>
          ))}
        </select>
      </div>

      {/* Or custom SQL */}
      <div className="mb-4">
        <label className="font-semibold">Or paste your own SQL:</label>
        <textarea
          className="w-full p-2 border h-24"
          value={customQuery}
          onChange={e => setCustomQuery(e.target.value)}
        />
      </div>

      {/* Prompt */}
      <div className="mb-4">
        <label className="font-semibold">Instruction / Prompt:</label>
        <textarea
          className="w-full p-2 border h-24"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="E.g. only select id and name"
        />
      </div>

      {/* Format only */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formatOnly}
            onChange={e => setFormatOnly(e.target.checked)}
            className="mr-2"
          />
          Only format (no changes)
        </label>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Working…' : 'Generate Modified Query'}
      </button>

      {/* Edit result */}
      {modifiedQuery && (
        <div className="mt-6">
          <h2 className="font-semibold">Edit Modified Query</h2>
          <textarea
            ref={editRef}
            className="w-full p-2 border mt-2 resize-none overflow-hidden"
            value={editableQuery}
            onChange={e => { setEditableQuery(e.target.value); autoResize(); }}
            onInput={autoResize}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleFinal}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Preview Diff
            </button>
            <button
              onClick={handleSubmit}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Send for Approval
            </button>
          </div>
        </div>
      )}

      {/* Diff preview */}
      {finalDiff && (
        <div className="mt-6">
          <h2 className="font-semibold">Final Diff</h2>
          <div
            className="bg-gray-100 p-4 rounded whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: finalDiff }}
          />
        </div>
      )}
    </div>
  );
}
