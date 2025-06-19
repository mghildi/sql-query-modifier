'use client';

import React, { useState, useEffect, useRef } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';

interface Submission {
  rowIndex: number;
  OriginalQuery: string;
  Prompt: string;
  ModifiedQuery: string;
  Status: string;
  SubmittedBy: string;
  ApprovedBy: string;
  Timestamp: string;
  BankName: string;
  Segment: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [finalDiff, setFinalDiff] = useState<string>('');
  const editBoxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/fetch-submissions')
      .then((res) => res.json())
      .then(setSubmissions)
      .catch(console.error);
  }, []);

  const handleDiff = (orig: string, newQ: string) => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(orig, newQ);
    dmp.diff_cleanupSemantic(diff);

    const html = diff
      .map(([type, text]: [number, string]) => {
        if (type === DiffMatchPatch.DIFF_INSERT) return `<b>${text}</b>`;
        if (type === DiffMatchPatch.DIFF_DELETE) return `<del>${text}</del>`;
        return text;
      })
      .join('');

    setFinalDiff(html);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Query Submissions</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th>#</th>
            <th>Original</th>
            <th>Prompt</th>
            <th>Modified</th>
            <th>Status</th>
            <th>By</th>
            <th>Approved By</th>
            <th>When</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.rowIndex} className="border-t">
              <td className="px-2 py-1">{s.rowIndex}</td>
              <td className="px-2 py-1"><pre>{s.OriginalQuery}</pre></td>
              <td className="px-2 py-1">{s.Prompt || '–'}</td>
              <td className="px-2 py-1"><pre>{s.ModifiedQuery}</pre></td>
              <td className="px-2 py-1">{s.Status}</td>
              <td className="px-2 py-1">{s.SubmittedBy}</td>
              <td className="px-2 py-1">{s.ApprovedBy || '–'}</td>
              <td className="px-2 py-1">
                {new Date(s.Timestamp).toLocaleString()}
              </td>
              <td className="px-2 py-1">
                <button
                  onClick={() =>
                    handleDiff(s.OriginalQuery, s.ModifiedQuery)
                  }
                  className="text-sm text-blue-600 underline"
                >
                  Diff
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {finalDiff && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Highlighted Diff</h2>
          <div
            className="bg-gray-50 p-4 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: finalDiff }}
          />
        </div>
      )}
    </div>
  );
}
