'use client';

import { useEffect, useState } from 'react';
import DiffMatchPatch from 'diff-match-patch';

export default function ReviewSubmissions() {
  const [bank, setBank] = useState('');
  const [segment, setSegment] = useState('');
  const [availableBanks, setAvailableBanks] = useState([]);
  const [availableSegments, setAvailableSegments] = useState([]);
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(res => res.json())
      .then(data => {
        setAvailableBanks(data.bankNames || []);
      });
  }, []);

  useEffect(() => {
    if (bank) {
      fetch(`/api/fetch-bank-segment?bank=${bank}`)
        .then(res => res.json())
        .then(data => {
          const filteredSegments = data.segmentMapping
            .filter(entry => entry.bank === bank)
            .map(entry => entry.segment);
          setAvailableSegments([...new Set(filteredSegments)]);
        });
    }
  }, [bank]);

  useEffect(() => {
    if (bank && segment) {
      fetch(`/api/fetch-queries?bank=${bank}&segment=${segment}`)
        .then(res => res.json())
        .then(data => setQueries(data || []));
    }
  }, [bank, segment]);

  const highlightDiff = (original, modified) => {
    if (!original || !modified) {
      return '<i>Either original or modified query is missing</i>';
    }
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(original, modified);
    dmp.diff_cleanupSemantic(diff);
    return diff.map(([type, text]) => {
      if (type === DiffMatchPatch.DIFF_INSERT) return `<b>${text}</b>`;
      if (type === DiffMatchPatch.DIFF_DELETE) return `<del>${text}</del>`;
      return text;
    }).join('');
  };

  const handleApprove = async (query) => {
    await fetch('/api/approve-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalQuery: query.originalQuery }),
    });
    alert('Query approved!');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Approve Existing Queries</h1>

      <div className="mb-4">
        <label className="font-semibold">Select Bank Name:</label>
        <select
          value={bank}
          onChange={e => setBank(e.target.value)}
          className="w-full p-2 border"
        >
          <option value="">-- Select Bank --</option>
          {availableBanks.map((b, i) => <option key={i} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="font-semibold">Select Segment:</label>
        <select
          value={segment}
          onChange={e => setSegment(e.target.value)}
          className="w-full p-2 border"
        >
          <option value="">-- Select Segment --</option>
          {availableSegments.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="font-semibold">Select Query:</label>
        <select
          onChange={e => setSelectedQuery(queries.find(q => q.originalQuery === e.target.value))}
          className="w-full p-2 border"
        >
          <option value="">-- Select Approved Query --</option>
          {queries.map((q, i) => (
            <option key={i} value={q.originalQuery}>{q.originalQuery.slice(0, 100)}...</option>
          ))}
        </select>
      </div>

      {selectedQuery && (
        <div className="border rounded p-4 bg-white">
          <p className="mb-2"><strong>Original Query:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">{selectedQuery.originalQuery}</pre>

          <p className="mt-4 mb-2"><strong>Modified Query (with changes highlighted):</strong></p>
          <div
            className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: highlightDiff(selectedQuery.originalQuery, selectedQuery.modifiedQuery),
            }}
          />

          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => handleApprove(selectedQuery)}
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
}
