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

  // Fetch master bank/segment mapping
  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(res => res.json())
      .then(data => {
        setBanks(data.bankNames || []);
        setMapping(data.segmentMapping || []);
      });
  }, []);

  // Fetch all pending submissions
  useEffect(() => {
    fetch('/api/fetch-submissions')
      .then(res => res.json())
      .then((data: Submission[]) => {
        const pending = data.filter(d => d.Status === 'Pending');
        setSubmissions(pending);
      });
  }, []);

  // Update segments when bank is selected
  useEffect(() => {
    if (!bank) return setSegments([]);
    const segs = mapping.filter(m => m.bank === bank).map(m => m.segment);
    setSegments(Array.from(new Set(segs)));
    setSegment('');
    setFiltered([]);
  }, [bank, mapping]);

  // Filter submissions for selected bank & segment
  useEffect(() => {
    if (!bank || !segment) return setFiltered([]);
    setFiltered(
      submissions.filter(s => s.BankName === bank && s.Segment === segment)
    );
  }, [bank, segment, submissions]);

  const reviewerName =
    reviewer === 'Others' ? customReviewer.trim() || 'Unknown' : reviewer;

  const handleDecision = async (
    item: Submission,
    action: 'approve' | 'reject'
  ) => {
    const url =
      action === 'approve' ? '/api/approve-submission' : '/api/reject-submission';
    const body =
      action === 'approve'
        ? { rowIndex: item.rowIndex, approvedBy: reviewerName }
        : { rowIndex: item.rowIndex, rejectedBy: reviewerName };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Remove item from UI
    setSubmissions(s => s.filter(r => r.rowIndex !== item.rowIndex));
    setFiltered(f => f.filter(r => r.rowIndex !== item.rowIndex));

    alert(`${action === 'approve' ? 'Approved' : 'Rejected'} by ${reviewerName}`);
  };

  const highlightDiff = (orig: string, mod: string) => {
    if (!orig || !mod) return '<i>Missing query</i>';
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(orig, mod);
    dmp.diff_cleanupSemantic(diff);
    return diff
      .map(([type, text]: [number, string]) => {
        if (type === DiffMatchPatch.DIFF_INSERT) return `<b>${text}</b>`;
        if (type === DiffMatchPatch.DIFF_DELETE) return `<del>${text}</del>`;
        return text;
      })
      .join('');
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
        <div key={item.rowIndex} className="border rounded p-4 mb-4 bg-white">
          <p><strong>Submitted By:</strong> {item.SubmittedBy}</p>
          <p><strong>Prompt:</strong> {item.Prompt}</p>
          <p className="mt-2"><strong>Changes:</strong></p>
          <div
            className="bg-gray-100 p-2 rounded whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: highlightDiff(item.OriginalQuery, item.ModifiedQuery),
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
        <p>No pending submissions for <em>{bank}</em> / <em>{segment}</em>.</p>
      )}
    </div>
  );
}
