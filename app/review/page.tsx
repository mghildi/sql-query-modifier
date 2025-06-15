'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [bank, setBank] = useState('');
  const [segment, setSegment] = useState('');
  const [reviewer, setReviewer] = useState('Mohit');
  const [customReviewer, setCustomReviewer] = useState('');
  const [availableBanks, setAvailableBanks] = useState<string[]>([]);
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<Submission[]>([]);

  useEffect(() => {
    fetch('/api/fetch-submissions')
      .then(res => res.json())
      .then((data: any) => {
        const pending = Array.isArray(data) ? data.filter(d => d.Status === 'Pending') : [];
        setSubmissions(pending);
        setAvailableBanks([...new Set(pending.map(s => s.BankName))]);
      });
  }, []);

  useEffect(() => {
    if (!bank) {
      setAvailableSegments([]);
      setSegment('');
      setFiltered([]);
      return;
    }
    const segs = submissions.filter(s => s.BankName === bank).map(s => s.Segment);
    setAvailableSegments([...new Set(segs)]);
    setSegment('');
    setFiltered([]);
  }, [bank, submissions]);

  useEffect(() => {
    if (bank && segment) {
      setFiltered(submissions.filter(s => s.BankName === bank && s.Segment === segment));
    }
  }, [bank, segment, submissions]);

  const highlightDiff = (orig: string, mod: string) => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(orig, mod);
    dmp.diff_cleanupSemantic(diff);
    return diff
      .map(([type, text]: [number, string]) => =>
        type === DiffMatchPatch.DIFF_INSERT
          ? `<b>${text}</b>`
          : type === DiffMatchPatch.DIFF_DELETE
          ? `<del>${text}</del>`
          : text
      )
      .join('');
  };

  const handleApprove = async (item: Submission) => {
    const approvedBy = reviewer === 'Others' ? customReviewer.trim() || 'Unknown' : reviewer;
    await fetch('/api/approve-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex: item.rowIndex, approvedBy }),
    });
    setFiltered(prev => prev.filter(r => r.rowIndex !== item.rowIndex));
    alert(`Approved by ${approvedBy}!`);
  };

  const handleReject = async (item: Submission) => {
    const rejectedBy = reviewer === 'Others' ? customReviewer.trim() || 'Unknown' : reviewer;
    await fetch('/api/reject-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowIndex: item.rowIndex, rejectedBy }),
    });
    setFiltered(prev => prev.filter(r => r.rowIndex !== item.rowIndex));
    alert(`Rejected by ${rejectedBy}`);
  };

  return (
    <div className="p-6 mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Review Submissions</h1>
        <Link href="/">
          <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
            &larr; Back to Submissions
          </button>
        </Link>
      </div>

      {/* Reviewer, filters, and list as before... */}
      {/* ...existing code for bank/segment filter and list goes here.*/}

    </div>
  );
}
