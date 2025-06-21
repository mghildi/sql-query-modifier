'use client';

import React, { useState, useEffect, useRef } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';

type Query = { originalQuery: string };
type BankSegment = {
  bankNames: string[];
  segmentMapping: { bank: string; segment: string }[];
};

export default function SubmissionsPage() {
  // ── Master data ──────────────────────────────────────
  const [bankList, setBankList]               = useState<string[]>([]);
  const [fullSegmentList, setFullSegmentList] = useState<BankSegment['segmentMapping']>([]);

  // ── Selections ───────────────────────────────────────
  const [selectedBank, setSelectedBank]       = useState('');
  const [customBank, setCustomBank]           = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [customSegment, setCustomSegment]     = useState('');

  // ── Fetched queries & chosen/pasted SQL ──────────────
  const [queries, setQueries]                 = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery]     = useState('');
  const [customQuery, setCustomQuery]         = useState('');

  // ── Prompt & LLM state ────────────────────────────────
  const [prompt, setPrompt]                   = useState('');
  const [modifiedQuery, setModifiedQuery]     = useState('');
  const [editableQuery, setEditableQuery]     = useState('');
  const [finalDiff, setFinalDiff]             = useState('');
  const [loading, setLoading]                 = useState(false);
  const [formatOnly, setFormatOnly]           = useState(false);
  const editBoxRef = useRef<HTMLTextAreaElement>(null);

  // ── 1) Load bank/segment master ───────────────────────
  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(r => r.json())
      .then((data: BankSegment) => {
        setBankList(data.bankNames);
        setFullSegmentList(data.segmentMapping);
      })
      .catch(console.error);
  }, []);

  // ── 2) Compute filtered segments ──────────────────────
  const filteredSegmentList = selectedBank && selectedBank !== 'Others'
    ? Array.from(new Set(
        fullSegmentList
          .filter(m => m.bank === selectedBank)
          .map(m => m.segment)
      ))
    : [];

  // ── 3) Fetch approved queries when bank+segment set ───
  useEffect(() => {
    const bankToSend    = selectedBank === 'Others' ? customBank    : selectedBank;
    const segmentToSend = selectedSegment === 'Others' ? customSegment : selectedSegment;
    if (!bankToSend || !segmentToSend) return;

    fetch(`/api/fetch-queries?bank=${encodeURIComponent(bankToSend)}&segment=${encodeURIComponent(segmentToSend)}`)
      .then(r => r.json())
      .then((qs: Query[]) => setQueries(Array.isArray(qs) ? qs : []))
      .catch(err => {
        console.error('Error fetching queries:', err);
        setQueries([]);
      });
  }, [selectedBank, selectedSegment, customBank, customSegment]);

  // ── Helpers ───────────────────────────────────────────
  const getBaseQuery = () =>
    customQuery.trim() !== '' ? customQuery : selectedQuery;

  const autoResize = () => {
    if (editBoxRef.current) {
      editBoxRef.current.style.height = 'auto';
      editBoxRef.current.style.height = editBoxRef.current.scrollHeight + 'px';
    }
  };

  // ── Generate or format ─────────────────────────────────
  const handleGenerate = async () => {
    setLoading(true);
    setFinalDiff('');
    const original = getBaseQuery();

    if (formatOnly) {
      const f = format(original);
      setModifiedQuery(f);
      setEditableQuery(f);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/modify-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuery: original, prompt }),
      });
      const { modifiedQuery: mod } = await res.json();
      const f = format(mod || '');
      setModifiedQuery(f);
      setEditableQuery(f);
    } catch {
      setModifiedQuery('Error generating modification');
    } finally {
      setLoading(false);
    }
  };

  // ── Diff highlighting ─────────────────────────────────
  const highlightDiff = (orig: string, mod: string) => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(orig, mod);
    dmp.diff_cleanupSemantic(diff);
    return diff
      .map(([t, txt]: [number, string]) => {
        if (t === DiffMatchPatch.DIFF_INSERT) return `<b>${txt}</b>`;
        if (t === DiffMatchPatch.DIFF_DELETE) return `<del>${txt}</del>`;
        return txt;
      })
      .join('');
  };

  const handleFinalSubmit = () => {
    setFinalDiff(highlightDiff(getBaseQuery(), editableQuery));
  };

  // ── Send for approval ─────────────────────────────────
  const handleSendForApproval = async () => {
    await fetch('/api/send-for-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalQuery: getBaseQuery(),
        prompt,
        modifiedQuery: editableQuery,
        bank: selectedBank,
        segment: selectedSegment,
      }),
    });
    alert('Sent for approval!');
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">SQL Query Modifier</h1>

      {/* Bank selector */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Bank:</label>
        <select
          value={selectedBank}
          onChange={e => setSelectedBank(e.target.value)}
          className="w-full p-2 border mb-2"
        >
          <option value="">-- Select Bank --</option>
          {bankList.map(b => <option key={b}>{b}</option>)}
          <option value="Others">Others</option>
        </select>
        {selectedBank === 'Others' && (
          <input
            className="w-full p-2 border"
            placeholder="Custom bank"
            value={customBank}
            onChange={e => setCustomBank(e.target.value)}
          />
        )}
      </div>

      {/* Segment selector */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Segment:</label>
        <select
          value={selectedSegment}
          onChange={e => setSelectedSegment(e.target.value)}
          className="w-full p-2 border mb-2"
        >
          <option value="">-- Select Segment --</option>
          {filteredSegmentList.map(s => <option key={s}>{s}</option>)}
          <option value="Others">Others</option>
        </select>
        {selectedSegment === 'Others' && (
          <input
            className="w-full p-2 border"
            placeholder="Custom segment"
            value={customSegment}
            onChange={e => setCustomSegment(e.target.value)}
          />
        )}
      </div>

      {/* Approved queries dropdown */}
      <div className="mb-4">
        <label className="font-semibold">Pick an approved query:</label>
        <select
          className="w-full p-2 border mb-2"
          value={selectedQuery}
          onChange={e => setSelectedQuery(e.target.value)}
        >
          <option value="">-- none --</option>
          {queries.map((q, i) => (
            <option key={i} value={q.originalQuery}>
              {q.originalQuery}
            </option>
          ))}
        </select>

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
          className="w-full p-2 border h-20"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </div>

      {/* Format-only toggle */}
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          className="mr-2"
          checked={formatOnly}
          onChange={e => setFormatOnly(e.target.checked)}
        />
        Only format (no changes)
      </label>

      {/* Generate */}
      <button
        disabled={loading}
        onClick={handleGenerate}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Generating…' : 'Generate Modified Query'}
      </button>

      {/* Editable result */}
      {modifiedQuery && (
        <div className="mb-6">
          <h2 className="font-semibold">Edit Modified Query</h2>
          <textarea
            ref={editBoxRef}
            className="w-full p-2 border resize-none overflow-hidden"
            value={editableQuery}
            onChange={e => { setEditableQuery(e.target.value); autoResize(); }}
            onInput={autoResize}
          />
          <div className="mt-2 flex gap-2">
            <button onClick={handleFinalSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit Final
            </button>
            <button onClick={handleSendForApproval} className="bg-yellow-500 text-white px-4 py-2 rounded">
              Send for Approval
            </button>
          </div>
        </div>
      )}

      {/* Diff view */}
      {finalDiff && (
        <div>
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
