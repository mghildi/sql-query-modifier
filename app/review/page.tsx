'use client';

import React, { useEffect, useState } from 'react';
import DiffMatchPatch from 'diff-match-patch';

type Submission = {
  rowIndex: number;
  BankName: string;
  Segment: string;
  OriginalQuery: string;
  Prompt: string;
  ModifiedQuery: string;
  Status: string;
  SubmittedBy: string;
  ApprovedBy: string;
  Timestamp: string;
};

type SegmentMapping = { bank: string; segment: string };

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filtered, setFiltered] = useState<Submission[]>([]);
  const [banks, setBanks] = useState<string[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [mapping, setMapping] = useState<SegmentMapping[]>([]);

  const [bank, setBank] = useState('');
  const [segment, setSegment] = useState('');

  const [reviewer, setReviewer] = useState('Mohit');
  const [customReviewer, setCustomReviewer] = useState('');

  // Fetch all submissions and derive bank/segment mapping from it
  useEffect(() => {
    fetch('/api/fetch-submissions')
      .then(res => res.json())
      .then((data: Submission[]) => {
        setSubmissions(data);
        setBanks([...new Set(data.map(d => d.BankName).filter(Boolean))]);
        setMapping(
          data
            .filter(d => d.BankName && d.Segment)
            .map(d => ({ bank: d.BankName, segment: d.Segment }))
        );
      });
  }, []);

  // Update segments when bank is selected
  useEffect(() => {
    if (!bank) {
      setSegments([]);
      return;
    }
    const segs = mapping
      .filter(m => m.bank === bank)
      .map(m => m.segment);
    setSegments(Array.from(new Set(segs)));
    setSegment('');
    setFiltered([]);
  }, [bank, mapping]);

  // Filter submissions for selected bank & segment
  useEffect(() => {
    if (!bank || !segment) {
      setFiltered([]);
      return;
    }
    setFiltered(
      submissions.filter(s => s.BankName === bank && s.Segment === segment)
    );
  }, [bank, segment, submissions]);

  const reviewerName =
    reviewer === 'Others' ? customReviewer.trim() || 'Unknown' : reviewer;

  // Helper to strip comments + collapse whitespace
  const minifySQL = (sql: string): string => {
    return sql
      .replace(/--.*$/gm, '')            // remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // remove block comments
      .replace(/\s+/g, ' ')              // collapse whitespace
      .trim();
  };

  const handleDecision = async (
    item: Submission,
    action: 'approve' | 'reject'
  ) => {
    const url =
      action === 'approve' ? '/api/approve-submission' : '/api/reject-submission';

    // If approving, minify the ModifiedQuery and include it
    const body: Record<string, any> =
      action === 'approve'
        ? {
            rowIndex: item.rowIndex,
            approvedBy: reviewerName,
            approvedQuery: minifySQL(item.ModifiedQuery),
          }
        : {
            rowIndex: item.rowIndex,
            rejectedBy: reviewerName,
          };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Remove item from UI
    setSubmissions(s => s.filter(r => r.rowIndex !== item.rowIndex));
    setFiltered(f => f.filter(r => r.rowIndex !== item.rowIndex));

    alert(
      action === 'approve'
        ? `Approved (minified) by ${reviewerName}`
        : `Rejected by ${reviewerName}`
    );
  };

  const highlightDiff = (orig: string, mod: string) => {
    if (!orig || !mod) return '<i>Missing query</i>';
    const dmp = new DiffMatchPatch();
    const tokenize = (sql: string) =>
      (sql.match(/\w+|[^\s\w]+/g) || [])
        .map(t => t.trim())
        .filter(Boolean);
    const origTokens = tokenize(orig);
    const modTokens = tokenize(mod);
    const diffs = dmp.diff_main(
      origTokens.join('\n'),
      modTokens.join('\n')
    );
    dmp.diff_cleanupSemantic(diffs);
    return diffs
      .map(([op, txt]: [number, string]) => {
        const token = txt.replace(/\n/g, '');
        if (op === DiffMatchPatch.DIFF_INSERT)
          return `<b style="color:red;">${token}</b> `;
        if (op === DiffMatchPatch.DIFF_DELETE)
          return `<del>${token}</del> `;
        return `${token} `;
      })
      .join('')
      .trim();
  };

  return (
    <div className="p-6 mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Review Submissions</h1>
      <a
        href="/"
        className="inline-block mb-4 text-blue-600 underline hover:text-blue-800"
      >
        ← Go to Home
      </a>

      {/* Reviewer */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Reviewer:</label>
        <select
          value={reviewer}
          onChange={e => setReviewer(e.target.value)}
          className="border p-2 rounded w-full"
        >
          {['Mohit', 'Bhaskar', 'Prerna', 'Others'].map(name => (
            <option key={name}>{name}</option>
          ))}
        </select>
        {reviewer === 'Others' && (
          <input
            type="text"
            placeholder="Your name"
            value={customReviewer}
            onChange={e => setCustomReviewer(e.target.value)}
            className="mt-2 border p-2 rounded w-full"
          />
        )}
      </div>

      {/* Bank Selector */}
      <div className="mb-4">
        <p className="font-semibold mb-2">Select Bank:</p>
        <div className="flex flex-wrap gap-2">
          {banks.map(b => (
            <button
              key={b}
              onClick={() => setBank(b)}
              className={`px-4 py-2 rounded ${
                bank === b ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Segment Selector */}
      {segments.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold mb-2">Select Segment:</p>
          <div className="flex flex-wrap gap-2">
            {segments.map(s => (
              <button
                key={s}
                onClick={() => setSegment(s)}
                className={`px-4 py-2 rounded ${
                  segment === s ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submissions List */}
      {filtered.map(item => (
        <div
          key={item.rowIndex}
          className="border rounded p-4 mb-4 bg-white"
        >
          <p>
            <strong>Submitted By:</strong> {item.SubmittedBy}
          </p>
          <p>
            <strong>Prompt:</strong> {item.Prompt}
          </p>
          <p className="mt-4">
            <strong>Original Query:</strong>
          </p>
          <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
            {item.OriginalQuery}
          </pre>
          <p className="mt-2">
            <strong>Modified Query:</strong>
          </p>
          <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
            {item.ModifiedQuery}
          </pre>
          <p className="mt-4">
            <strong>Changes:</strong>
          </p>
          <div
            className="bg-gray-100 p-2 rounded whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{
              __html: highlightDiff(
                item.OriginalQuery,
                item.ModifiedQuery
              ),
            }}
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleDecision(item, 'approve')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecision(item, 'reject')}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {bank && segment && filtered.length === 0 && (
        <p>
          No submissions found for <em>{bank}</em> /{' '}
          <em>{segment}</em>.
        </p>
      )}
    </div>
  );
}
