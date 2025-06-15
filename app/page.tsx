'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';

export default function Home() {
  // State for queries list
  const [queries, setQueries] = useState<{ originalQuery: string }[]>([]);
  const [selectedQuery, setSelectedQuery] = useState('');
  const [customQuery, setCustomQuery] = useState('');

  // State for LLM prompt & results
  const [prompt, setPrompt] = useState('');
  const [modifiedQuery, setModifiedQuery] = useState('');
  const [editableQuery, setEditableQuery] = useState('');
  const [finalDiff, setFinalDiff] = useState('');
  const [loading, setLoading] = useState(false);
  const [formatOnly, setFormatOnly] = useState(false);
  const editBoxRef = useRef<HTMLTextAreaElement>(null);

  // User / approval metadata
  const [user, setUser] = useState('Mohit');
  const [customUser, setCustomUser] = useState('');

  // Bank & segment lists
  const [bankList, setBankList] = useState<string[]>([]);
  const [fullSegmentList, setFullSegmentList] = useState<{ bank: string; segment: string }[]>([]);
  const [filteredSegmentList, setFilteredSegmentList] = useState<string[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [customSegment, setCustomSegment] = useState('');

  // Fetch bank & segment mappings on mount
  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(res => res.json())
      .then(data => {
        setBankList(data.bankNames || []);
        setFullSegmentList(data.segmentMapping || []);
      });
  }, []);

  // Update segments when bank changes
  useEffect(() => {
    if (selectedBank && selectedBank !== 'Others') {
      const segs = fullSegmentList
        .filter(item => item.bank === selectedBank)
        .map(item => item.segment);
      setFilteredSegmentList([...new Set(segs)]);
    } else {
      setFilteredSegmentList([]);
    }
    setSelectedSegment('');
    setQueries([]);
  }, [selectedBank, fullSegmentList]);

  // Fetch approved queries when both bank & segment selected
  useEffect(() => {
    const bankToSend = selectedBank === 'Others' ? customBank : selectedBank;
    const segmentToSend = selectedSegment === 'Others' ? customSegment : selectedSegment;
    if (bankToSend && segmentToSend) {
      fetch(
        `/api/fetch-queries?bank=${encodeURIComponent(bankToSend)}&segment=${encodeURIComponent(segmentToSend)}`
      )
        .then(res => res.json())
        .then(data => {
          setQueries(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Error fetching filtered queries:', err);
          setQueries([]);
        });
    }
  }, [selectedBank, selectedSegment, customBank, customSegment]);

  // Base query (custom vs selected)
  const getBaseQuery = () => (customQuery.trim() !== '' ? customQuery : selectedQuery);

  // Auto-resize textarea
  const autoResize = () => {
    if (editBoxRef.current) {
      editBoxRef.current.style.height = 'auto';
      editBoxRef.current.style.height = editBoxRef.current.scrollHeight + 'px';
    }
  };

  // Send final approved submission
  const handleSendForApproval = async () => {
    const approvedBy = user === 'Others' ? customUser.trim() || 'Unknown' : user;
    try {
      const res = await fetch('/api/send-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuery: getBaseQuery(),
          prompt,
          modifiedQuery: editableQuery,
          submittedBy: approvedBy,
          bank: selectedBank === 'Others' ? customBank : selectedBank,
          segment: selectedSegment === 'Others' ? customSegment : selectedSegment,
        }),
      });
      const result = await res.json();
      alert(result.status === 'submitted' ? 'Query submitted!' : 'Submission failed');
    } catch (err) {
      console.error(err);
      alert('Error submitting for approval');
    }
  };

  // Generate via LLM or format only
  const handleGenerate = async () => {
    setLoading(true);
    setFinalDiff('');
    const original = getBaseQuery();
    try {
      if (formatOnly) {
        const formatted = format(original);
        setModifiedQuery(formatted);
        setEditableQuery(formatted);
      } else {
        const res = await fetch('/api/modify-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalQuery: original, prompt }),
        });
        const data = await res.json();
        const formatted = format(data.modifiedQuery || '');
        setModifiedQuery(formatted);
        setEditableQuery(formatted);
      }
    } catch (err) {
      setModifiedQuery('Error contacting LLM API');
    } finally {
      setLoading(false);
    }
  };

  // Compute & highlight diff
  const handleFinalSubmit = () => {
    const orig = getBaseQuery();
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(orig.replace(/\s+/g, ' ').trim(), editableQuery.replace(/\s+/g, ' ').trim());
    dmp.diff_cleanupSemantic(diff);
    setFinalDiff(
  diff
    .map((pair: [number, string]): string => {
      const [diffType, text] = pair;
      if (diffType === DiffMatchPatch.DIFF_INSERT) return `<b>${text}</b>`;
      if (diffType === DiffMatchPatch.DIFF_DELETE) return `<del>${text}</del>`;
      return text;
    })
    .join('')
);



  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4 flex items-center justify-between">
        SQL Query Modifier
        <Link href="/review">
          <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">
            Go to Review
          </button>
        </Link>
      </h1>
      {/* User selector */}
      <div className="mb-4">
        <label className="font-semibold">Select User:</label>
        <select value={user} onChange={e => setUser(e.target.value)} className="w-full p-2 border mb-2">
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
            className="w-full p-2 border"
          />
        )}
      </div>

      {/* Bank selector */}
      <div className="mb-4">
        <label className="font-semibold">Select Bank Name:</label>
        <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className="w-full p-2 border">
          <option value="">-- Select Bank --</option>
          {bankList.map((b,i) => <option key={i} value={b}>{b}</option>)}
          <option value="Others">Others</option>
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

      {/* Segment selector */}
      <div className="mb-4">
        <label className="font-semibold">Select Segment:</label>
        <select value={selectedSegment} onChange={e => setSelectedSegment(e.target.value)} className="w-full p-2 border">
          <option value="">-- Select Segment --</option>
          {filteredSegmentList.map((s,i) => <option key={i} value={s}>{s}</option>)}
          <option value="Others">Others</option>
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

      {/* Approved queries dropdown */}
      <label className="font-semibold">Select an approved query:</label>
      <select onChange={e => setSelectedQuery(e.target.value)} className="w-full mb-4 p-2 border">
        <option value="">-- Select Approved Query --</option>
        {queries.length > 0 ? (
          queries.map((q,i) => <option key={i} value={q.originalQuery}>{q.originalQuery}</option>)
        ) : (
          <option disabled>No approved queries found</option>
        )}
      </select>

      {/* Custom query textarea */}
      <label className="font-semibold">Or paste your own query:</label>
      <textarea
        value={customQuery}
        onChange={e => setCustomQuery(e.target.value)}
        placeholder="Paste your SQL query here..."
        className="w-full mb-4 p-2 border h-24"
      />

      {/* Prompt textarea */}
      <label className="font-semibold">Instruction / Prompt:</label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="What change do you want to make to the query?"
        className="w-full mb-4 p-2 border h-24"
      />

      {/* Format-only toggle */}
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          className="mr-2"
          checked={formatOnly}
          onChange={e => setFormatOnly(e.target.checked)}
        />
        Only format query without changes
      </label>

      {/* Generate button */}
      <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Modifying...' : 'Generate Modified Query'}
      </button>

      {/* Editable result & actions */}
      {modifiedQuery && (
        <div className="mt-6">
          <h2 className="font-bold">Edit Modified Query</h2>
          <textarea
            ref={editBoxRef}
            value={editableQuery}
            onChange={e => { setEditableQuery(e.target.value); autoResize(); }}
            onInput={autoResize}
            className="w-full p-2 border mt-2 overflow-hidden resize-none"
          />
          <div className="flex gap-4 mt-3">
            <button onClick={handleFinalSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
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
        <div className="mt-6">
          <h2 className="font-bold">Final Query with Highlighted Changes</h2>
          <div
            className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-black"
            dangerouslySetInnerHTML={{ __html: finalDiff }}
          />
        </div>
      )}
    </div>
  );
}
