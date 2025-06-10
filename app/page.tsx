'use client';

import { useState, useEffect, useRef } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';

export default function Home() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [modifiedQuery, setModifiedQuery] = useState('');
  const [editableQuery, setEditableQuery] = useState('');
  const [finalDiff, setFinalDiff] = useState('');
  const [loading, setLoading] = useState(false);
  const [formatOnly, setFormatOnly] = useState(false);
  const editBoxRef = useRef(null);

  const [user, setUser] = useState('Mohit');
  const [customUser, setCustomUser] = useState('');
  const [bankList, setBankList] = useState([]);
  const [fullSegmentList, setFullSegmentList] = useState([]);
  const [filteredSegmentList, setFilteredSegmentList] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [customSegment, setCustomSegment] = useState('');

  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(res => res.json())
      .then(data => {
        setBankList(data.bankNames || []);
        setFullSegmentList(data.segmentMapping || []);
      });
  }, []);

  useEffect(() => {
    if (selectedBank && selectedBank !== 'Others') {
      const segments = fullSegmentList
        .filter(item => item.bank === selectedBank)
        .map(item => item.segment);
      setFilteredSegmentList([...new Set(segments)]);
    } else {
      setFilteredSegmentList([]);
    }
    setSelectedSegment('');
    setQueries([]);
  }, [selectedBank, fullSegmentList]);

  useEffect(() => {
    const bankToSend = selectedBank === 'Others' ? customBank : selectedBank;
    const segmentToSend = selectedSegment === 'Others' ? customSegment : selectedSegment;
    if (bankToSend && segmentToSend) {
      fetch(`/api/fetch-queries?bank=${encodeURIComponent(bankToSend)}&segment=${encodeURIComponent(segmentToSend)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setQueries(data);
          } else {
            setQueries([]);
          }
        })
        .catch(err => {
          console.error('Error fetching filtered queries:', err);
          setQueries([]);
        });
    }
  }, [selectedBank, selectedSegment, customBank, customSegment]);

  const getBaseQuery = () => customQuery.trim() !== '' ? customQuery : selectedQuery;

  const autoResize = () => {
    if (editBoxRef.current) {
      editBoxRef.current.style.height = 'auto';
      editBoxRef.current.style.height = editBoxRef.current.scrollHeight + 'px';
    }
  };

  const handleSendForApproval = async () => {
    try {
      const res = await fetch('/api/send-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuery: getBaseQuery(),
          prompt,
          modifiedQuery: editableQuery,
          submittedBy: user === 'Others' ? customUser : user,
          bank: selectedBank === 'Others' ? customBank : selectedBank,
          segment: selectedSegment === 'Others' ? customSegment : selectedSegment,
        }),
      });

      const result = await res.json();
      if (result.status === 'submitted') {
        alert('Query submitted for approval!');
      } else {
        alert('Failed to submit!');
      }
    } catch (err) {
      console.error(err);
      alert('API error submitting for approval');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setFinalDiff('');
    const originalQuery = getBaseQuery();

    try {
      if (formatOnly) {
        const formatted = format(originalQuery);
        setModifiedQuery(formatted);
        setEditableQuery(formatted);
        return;
      }

      const res = await fetch('/api/modify-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuery, prompt }),
      });

      const data = await res.json();
      const formatted = format(data.modifiedQuery || '');
      setModifiedQuery(formatted);
      setEditableQuery(formatted);
    } catch {
      setModifiedQuery('Error contacting LLM API');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    const original = getBaseQuery();
    const minifiedNew = minifySQL(editableQuery || '');
    const minifiedOriginal = minifySQL(original);
    const diff = highlightDiff(minifiedOriginal, minifiedNew);
    setFinalDiff(diff);
  };

  const normalizeSQL = (query) =>
    query.replace(/\s+/g, ' ').replace(/["“”]/g, "'").trim();

  const highlightDiff = (original, modified) => {
    const dmp = new DiffMatchPatch();
    const cleanOriginal = normalizeSQL(original);
    const cleanModified = normalizeSQL(modified);
    const diff = dmp.diff_main(cleanOriginal, cleanModified);
    dmp.diff_cleanupSemantic(diff);
    return diff
      .map(([type, text]) => {
        if (type === DiffMatchPatch.DIFF_INSERT) return `<b>${text}</b>`;
        if (type === DiffMatchPatch.DIFF_DELETE) return `<del>${text}</del>`;
        return text;
      })
      .join('');
  };

  const minifySQL = (query) =>
    query.replace(/\s+/g, ' ').replace(/\s*\n\s*/g, ' ').trim();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">SQL Query Modifier</h1>

      <div className="mb-4">
        <label className="font-semibold">Select User:</label>
        <select
          value={user}
          onChange={e => setUser(e.target.value)}
          className="w-full p-2 border mb-2"
        >
          <option value="Mohit">Mohit</option>
          <option value="Bhaskar">Bhaskar</option>
          <option value="Prerna">Prerna</option>
          <option value="Others">Others</option>
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

      <div className="mb-4">
        <label className="font-semibold">Select Bank Name:</label>
        <select
          value={selectedBank}
          onChange={e => setSelectedBank(e.target.value)}
          className="w-full p-2 border"
        >
          <option value="">-- Select Bank --</option>
          {bankList.map((b, i) => <option key={i} value={b}>{b}</option>)}
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

      <div className="mb-4">
        <label className="font-semibold">Select Segment:</label>
        <select
          value={selectedSegment}
          onChange={e => setSelectedSegment(e.target.value)}
          className="w-full p-2 border"
        >
          <option value="">-- Select Segment --</option>
          {filteredSegmentList.map((s, i) => <option key={i} value={s}>{s}</option>)}
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

      <label className="font-semibold">Select an approved query:</label>
      <select
        onChange={e => setSelectedQuery(e.target.value)}
        className="w-full mb-4 p-2 border"
      >
        <option value="">-- Select Approved Query --</option>
        {Array.isArray(queries) && queries.length > 0 ? (
          queries.map((q, i) => (
            <option key={i} value={q.originalQuery}>{q.originalQuery}</option>
          ))
        ) : (
          <option disabled>No approved queries found</option>
        )}
      </select>

      <label className="font-semibold">Or paste your own query:</label>
      <textarea
        value={customQuery}
        onChange={e => setCustomQuery(e.target.value)}
        placeholder="Paste your SQL query here..."
        className="w-full mb-4 p-2 border h-20"
      />

      <label className="font-semibold">Instruction / Prompt:</label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="What change do you want to make to the query?"
        className="w-full mb-4 p-2 border h-20"
      />

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          className="mr-2"
          checked={formatOnly}
          onChange={e => setFormatOnly(e.target.checked)}
        />
        Only format query without changes
      </label>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Modifying...' : 'Generate Modified Query'}
      </button>

      {modifiedQuery && (
        <div className="mt-6">
          <h2 className="font-bold">Edit Modified Query</h2>
          <textarea
            ref={editBoxRef}
            value={editableQuery}
            onChange={e => {
              setEditableQuery(e.target.value);
              autoResize();
            }}
            className="w-full p-2 border mt-2 overflow-hidden resize-none"
            onInput={autoResize}
          />
          <div className="flex gap-4">
            <button
              onClick={handleFinalSubmit}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit Final
            </button>
            <button
              onClick={handleSendForApproval}
              className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Send for Approval
            </button>
          </div>
        </div>
      )}

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
