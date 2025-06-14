'use client';

import React, { useEffect, useState } from 'react';
import DiffMatchPatch from 'diff-match-patch';

type Submission = {
  rowIndex:      number;
  BankName:      string;
  Segment:       string;
  OriginalQuery: string;
  Prompt:        string;
  ModifiedQuery: string;
  Status:        string;
  SubmittedBy:   string;
  ApprovedBy:    string;
  Timestamp:     string;
};

type SegmentMapping = { bank: string; segment: string };

export default function ReviewPage() {
  const [submissions, setSubmissions]               = useState<Submission[]>([]);
  const [bank, setBank]                             = useState('');
  const [segment, setSegment]                       = useState('');
  const [reviewer, setReviewer]                     = useState('Mohit');
  const [customReviewer, setCustomReviewer]         = useState('');
  const [availableBanks, setAvailableBanks]         = useState<string[]>([]);
  const [segmentMapping, setSegmentMapping]         = useState<SegmentMapping[]>([]);
  const [availableSegments, setAvailableSegments]   = useState<string[]>([]);
  const [filtered, setFiltered]                     = useState<Submission[]>([]);

  // 1) Load master bank/segment list from Sheet1
  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(res => res.json())
      .then((data: { bankNames: string[]; segmentMapping: SegmentMapping[] }) => {
        setAvailableBanks(data.bankNames || []);
        setSegmentMapping(data.segmentMapping || []);
      })
      .catch(err => console.error('Error loading master data:', err));
  }, []);

  // 2) Load pending submissions
  useEffect(() => {
    fetch('/api/fetch-submissions')
      .then(res => res.json())
      .then((data: Submission[]) => {
        if (!Array.isArray(data)) return;
        const pending = data.filter(d => d.Status === 'Pending');
        setSubmissions(pending);
      })
      .catch(err => console.error('Error loading submissions:', err));
  }, []);

  // 3) Compute segments for selected bank
  useEffect(() => {
    if (!bank) {
      setAvailableSegments([]);
      setSegment('');
      setFiltered([]);
      return;
    }
    const segs = segmentMapping
      .filter(m => m.bank === bank)
      .map(m => m.segment);
    setAvailableSegments(Array.from(new Set(segs)));
    setSegment('');
    setFiltered([]);
  }, [bank, segmentMapping]);

  // 4) Filter submissions by bank & segment
  useEffect(() => {
    if (bank && segment) {
      setFiltered(
        submissions.filter(
          s => s.BankName === bank && s.Segment === segment
        )
      );
    }
  }, [bank, segment, submissions]);

  const highlightDiff = (orig: string, mod: string) => {
    if (!orig || !mod) return '<i>Missing query</i>';
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(orig, mod);
    dmp.diff_cleanupSemantic(diff);
    return diff
      .map(([type, text]: [number, string]) =>
        type === DiffMatchPatch.DIFF_INSERT
          ? `<b>${text}</b>`
          : type === DiffMatchPatch.DIFF_DELETE
          ? `<del>${text}</del>`
          : text
      )
      .join('');
  };

  const handleApprove = async (item: Submission) => {
    const approvedBy =
      reviewer === 'Others'
        ? customReviewer.trim() || 'Unknown'
        : reviewer;
    await fetch('/api/approve-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex: item.rowIndex, approvedBy }),
    });
    setSubmissions(s => s.filter(r => r.rowIndex !== item.rowIndex));
    setFiltered(f => f.filter(r => r.rowIndex !== item.rowIndex));
    alert(`Approved by ${approvedBy}!`);
  };

  const handleReject = async (item: Submission) => {
    const rejectedBy =
      reviewer === 'Others'
        ? customReviewer.trim() || 'Unknown'
        : reviewer;
    await fetch('/api/reject-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex: item.rowIndex, rejectedBy }),
    });
    setSubmissions(s => s.filter(r => r.rowIndex !== item.rowIndex));
    setFiltered(f => f.filter(r => r.rowIndex !== item.rowIndex));
    alert(`Rejected by ${rejectedBy}`);
  };

  return (
    <div className="p-6 mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Review Submissions</h1>

      {/* Reviewer selector */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Reviewer:</label>
        <select
          value={reviewer}
          onChange={e => setReviewer(e.target.value)}
          className="border p-2 rounded"
        >
          <option>Mohit</option>
          <option>Bhaskar</option>
          <option>Prerna</option>
          <option>Others</option>
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

      {/* Bank buttons */}
      <div className="mb-4">
        <p className="font-semibold mb-2">Select Bank:</p>
        <div className="flex flex-wrap gap-2">
          {availableBanks.map((b, i) => (
            <button
              key={i}
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

      {/* Segment buttons */}
      {availableSegments.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold mb-2">Select Segment:</p>
          <div className="flex flex-wrap gap-2">
            {availableSegments.map((s, i) => (
              <button
                key={i}
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

      {/* Pending rows */}
      {filtered.map((item, idx) => (
        <div key={idx} className="border rounded p-4 mb-4 bg-white">
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
              onClick={() => handleApprove(item)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(item)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      {bank && segment && filtered.length === 0 && (
        <p>
          No pending submissions for <em>{bank}</em> / <em>{segment}</em>.
        </p>
      )}
    </div>
  );
}
