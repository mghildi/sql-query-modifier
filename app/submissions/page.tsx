'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';
import Link from 'next/link';

// shape of an approved query from the API
interface ApprovedQuery {
  originalQuery: string;
}

export default function SubmissionsPage() {
  // — user metadata
  const [user, setUser] = useState<string>('Mohit');
  const [customUser, setCustomUser] = useState<string>('');

  // — bank/segment → approved queries
  const [bankList, setBankList] = useState<string[]>([]);
  const [segmentList, setSegmentList] = useState<string[]>([]);
  const [queries, setQueries] = useState<ApprovedQuery[]>([]);

  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('');

  // — chosen query or custom
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');

  // — prompt, LLM results, editing & diff
  const [prompt, setPrompt] = useState<string>('');
  const [modifiedQuery, setModifiedQuery] = useState<string>('');
  const [editableQuery, setEditableQuery] = useState<string>('');
  const [finalDiff, setFinalDiff] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const editBoxRef = useRef<HTMLTextAreaElement>(null);

  // — fetch bank & segment mapping
  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(res => res.json())
      .then((data: { bankNames: string[]; segmentMapping: { bank: string; segment: string }[] }) => {
        setBankList(data.bankNames || []);
      })
      .catch(console.error);
  }, []);

  // — when bank changes, pull its segments
  useEffect(() => {
    if (!selectedBank) {
      setSegmentList([]);
      setSelectedSegment('');
      setQueries([]);
      return;
    }
    fetch(`/api/fetch-bank-segment?bank=${encodeURIComponent(selectedBank)}`)
      .then(res => res.json())
      .then((data: { segments: string[] }) => {
        setSegmentList(data.segments || []);
      })
      .catch(console.error);
    setSelectedSegment('');
    setQueries([]);
  }, [selectedBank]);

  // — when segment changes, fetch approved queries
  useEffect(() => {
    if (!selectedBank || !selectedSegment) return;
    fetch(
      `/api/fetch-queries?bank=${encodeURIComponent(selectedBank)}&segment=${encodeURIComponent(
        selectedSegment
      )}`
    )
      .then(res => res.json())
      .then((data: ApprovedQuery[]) => setQueries(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedBank, selectedSegment]);

  // — pick base SQL
  const getBaseQuery = () => (customQuery.trim() ? customQuery : selectedQuery);

  // — auto-resize textarea
  const autoResize = () => {
    if (editBoxRef.current) {
      editBoxRef.current.style.height = 'auto';
      editBoxRef.current.style.height = editBoxRef.current.scrollHeight + 'px';
    }
  };

  // — generate (format-only or via LLM)
  const handleGenerate = async () => {
    const original = getBaseQuery().trim();
    if (!original) return alert('Please select or paste a query first.');

    setLoading(true);
    setFinalDiff('');
    try {
      if (prompt.trim() === '') {
        // format only
        const formatted = format(original);
        setModifiedQuery(formatted);
        setEditableQuery(formatted);
      } else {
        // call your modify-query API
        const res = await fetch('/api/modify-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalQuery: original, prompt }),
        });
        const data = await res.json();
        const formatted = format(data.modifiedQuery || original);
        setModifiedQuery(formatted);
        setEditableQuery(formatted);
      }
    } catch (err) {
      console.error(err);
      alert('Error generating modified query');
    } finally {
      setLoading(false);
    }
  };

  // — compute & show diff
  const handleShowDiff = () => {
    const orig = getBaseQuery().trim().replace(/\s+/g, ' ');
    const mod = (editableQuery || '').trim().replace(/\s+/g, ' ');
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(orig, mod);
    dmp.diff_cleanupSemantic(diff);
    const html = diff
      .map(([type, text]) =>
        type === DiffMatchPatch.DIFF_INSERT
          ? `<b>${text}</b>`
          : type === DiffMatchPatch.DIFF_DELETE
          ? `<del>${text}</del>`
          : text
      )
      .join('');
    setFinalDiff(html);
  };

  // — send for approval
  const handleSendForApproval = async () => {
    const submittedBy = user === 'Others' ? customUser.trim() || 'Unknown' : user;
    try {
      await fetch('/api/send-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuery: getBaseQuery(),
          prompt,
          modifiedQuery: editableQuery,
          submittedBy,
          bank: selectedBank,
          segment: selectedSegment,
        }),
      });
      alert('Submitted for approval!');
    } catch {
      alert('Submission failed.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">SQL Query Modifier</h1>
        <Link href="/review">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Go to Review</button>
        </Link>
      </div>

      {/* — User */}
      <label className="block font-semibold">Your name:</label>
      <select
        value={user}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setUser(e.target.value)}
        className="w-full mb-4 p-2 border"
      >
        <option>Mohit</option>
        <option>Bhaskar</option>
        <option>Prerna</option>
        <option>Others</option>
      </select>
      {user === 'Others' && (
        <input
          type="text"
          placeholder="Enter your name"
          value={customUser}
          onChange={e => setCustomUser(e.target.value)}
          className="w-full mb-4 p-2 border"
        />
      )}

      {/* — Banks */}
      <label className="block font-semibold">Select Bank:</label>
      <div className="mb-4 space-x-2">
        {bankList.map(b => (
          <button
            key={b}
            onClick={() => setSelectedBank(b)}
            className={`px-3 py-1 rounded ${b === selectedBank ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* — Segments */}
      {segmentList.length > 0 && (
        <>
          <label className="block font-semibold">Select Segment:</label>
          <div className="mb-4 space-x-2">
            {segmentList.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSegment(s)}
                className={`px-3 py-1 rounded ${
                  s === selectedSegment ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {/* — Approved queries dropdown */}
      <label className="block font-semibold">Pick an approved query:</label>
      <select
        value={selectedQuery}
        onChange={e => setSelectedQuery(e.target.value)}
        className="w-full mb-4 p-2 border"
      >
        <option value="">-- none --</option>
        {queries.map((q, i) => (
          <option key={i} value={q.originalQuery}>
            {q.originalQuery}
          </option>
        ))}
      </select>

      {/* — Custom SQL */}
      <label className="block font-semibold">Or paste your own SQL:</label>
      <textarea
        value={customQuery}
        onChange={e => setCustomQuery(e.target.value)}
        className="w-full mb-4 p-2 border h-24"
        placeholder="Your SQL here…"
      />

      {/* — Prompt */}
      <label className="block font-semibold">Instruction / Prompt:</label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="w-full mb-4 p-2 border h-24"
        placeholder="E.g. “Only select name and email.”"
      />

      {/* — Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Generating…' : 'Generate Modified Query'}
      </button>

      {/* — Editable result */}
      {modifiedQuery && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Edit Modified Query</h2>
          <textarea
            ref={editBoxRef}
            value={editableQuery}
            onChange={e => {
              setEditableQuery(e.target.value);
              autoResize();
            }}
            onInput={autoResize}
            className="w-full p-2 border resize-none overflow-hidden"
          />
          <div className="flex gap-4 mt-3">
            <button onClick={handleShowDiff} className="bg-blue-600 text-white px-4 py-2 rounded">
              Show Diff
            </button>
            <button onClick={handleSendForApproval} className="bg-yellow-500 text-white px-4 py-2 rounded">
              Send for Approval
            </button>
          </div>
        </div>
      )}

      {/* — Diff view */}
      {finalDiff && (
        <div>
          <h2 className="font-semibold mb-2">Final Diff</h2>
          <div
            className="bg-gray-100 p-4 rounded whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: finalDiff }}
          />
        </div>
      )}
    </div>
  );
}
