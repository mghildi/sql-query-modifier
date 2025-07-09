'use client';

import { useState, useEffect, useRef } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import { format } from 'sql-formatter';
import Link from 'next/link';

export default function SubmissionsPage() {
  const [bankList, setBankList] = useState<string[]>([]);
  const [fullSegmentList, setFullSegmentList] = useState<{ bank: string; segment: string }[]>([]);
  const [filteredSegments, setFilteredSegments] = useState<string[]>([]);
  const [queries, setQueries] = useState<{ originalQuery: string; rowIndex?: number }[]>([]);

  const [user, setUser] = useState('Mohit');
  const [customUser, setCustomUser] = useState('');
  const [bank, setBank] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [segment, setSegment] = useState('');
  const [customSegment, setCustomSegment] = useState('');
  const [selectedQuery, setSelectedQuery] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [formatOnly, setFormatOnly] = useState(false);

  const [modifiedQuery, setModifiedQuery] = useState('');
  const [editableQuery, setEditableQuery] = useState('');
  const [finalDiff, setFinalDiff] = useState('');
  const [loading, setLoading] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const [complianceLoading, setComplianceLoading] = useState(false)
  const [complianceResult, setComplianceResult]   = useState('')

  useEffect(() => {
    fetch('/api/fetch-bank-segment')
      .then(r => r.json())
      .then(d => {
        setBankList(d.bankNames || []);
        setFullSegmentList(d.segmentMapping || []);
      });
  }, []);

  useEffect(() => {
    const b = bank === 'Others' ? (customBank || '').trim() : bank;

    if (b) {
      const segs = fullSegmentList.filter(x => x.bank === b).map(x => x.segment);
      setFilteredSegments(Array.from(new Set(segs)));
    } else {
      setFilteredSegments([]);
    }
    setSegment('');
    setQueries([]);
  }, [bank, customBank, fullSegmentList]);

  // after you load bankList & fullSegmentList...
  useEffect(() => {
    const b = bank === 'Others' ? customBank.trim() : bank;
    const s = segment === 'Others' ? (customSegment || '').trim() : segment;
    if (b && s) {
      fetch(`/api/fetch-queries?bank=${encodeURIComponent(b)}&segment=${encodeURIComponent(s)}`)
        .then(r => r.json())
        .then((d: Array<{ originalQuery: string; rowIndex?: number }>) => {
          setQueries(d);
          if (d.length > 0) {
            // take the first returned query and populate the editor
            setEditableQuery(d[0].originalQuery);
            setModifiedQuery(d[0].originalQuery);
            setSelectedQuery(d[0].originalQuery);
          } else {
            // clear if none
            setEditableQuery('');
            setModifiedQuery('');
          }
        })
        .catch(() => {
          setQueries([]);
          setEditableQuery('');
          setModifiedQuery('');
        });
    } else {
      setQueries([]);
      setEditableQuery('');
      setModifiedQuery('');
    }
  }, [bank, customBank, segment, customSegment]);

  const baseQuery = () => (customQuery || '').trim() || selectedQuery;
  

  const autoResize = () => {
    if (editRef.current) {
      editRef.current.style.height = 'auto';
      editRef.current.style.height = editRef.current.scrollHeight + 'px';
    }
  };
  useEffect(() => {
    autoResize();
}, [editableQuery]);
  const handleComplianceCheck = async () => {
    setComplianceLoading(true);
    try {
      const res = await fetch('/api/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: editableQuery })
      });

      const { result } = await res.json();
      setComplianceResult(result);
    } catch (e: any) {
      setComplianceResult(`Error: ${e.message}`);
    } finally {
      setComplianceLoading(false);
    }
  };
  
  // after you fetch & set complianceResult…
// After you’ve done `setComplianceResult(result)`:
  const errorExplanation = (complianceResult
    || '').trim()
    .replace(/^\[(?:✔️|❌)\]\s*/, '')






  
  const handleGenerate = async () => {
    setLoading(true);
    setFinalDiff('');
    const orig = baseQuery();
    if (formatOnly) {
      const f = orig
        .replace(/\s+/g, ' ')
        .replace(/\s*([(),=<>])\s*/g, '$1')
        .trim();
      setModifiedQuery(f);
      setEditableQuery(f);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/modify-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalQuery: orig, prompt }),
      });
      const { modifiedQuery: mod = '' } = await res.json();
      const f = format(mod || '');
      setModifiedQuery(f);
      setEditableQuery(f);
    } catch {
      setModifiedQuery('Error contacting LLM');
    } finally {
      setLoading(false);
    }
  };

  // const normalizeSQLForDiff = (sql: string) =>
  //   sql
  //     .replace(/\bNOT\s+IN\b/gi, '__NOTIN__')      // tag "NOT IN" for atomic comparison
  //     .replace(/\s*([=<>(),])\s*/g, ' $1 ')        // normalize symbol spacing
  //     .replace(/\s{2,}/g, ' ')                        // collapse multiple spaces
  //     .trim();
  const handleFinal = () => {
    const dmp = new DiffMatchPatch();
    
    // Step 1: turn SQL into tokens
    // const tokenize = (sql: string) =>
    //   (sql.match(/\w+|[^\s\w]+/g) || [])
    //     .map(t => t.trim())
    //     .filter(Boolean);

    // // Step 2: get token lists
    // const origTokens = tokenize(baseQuery());
    // const modTokens  = tokenize(editableQuery);

    // Step 3: diff on one‐token per line
    const origNorm = minifySQL(baseQuery());
    const modNorm  = minifySQL(editableQuery);
        // Step 1: turn SQL into tokens
    const tokenize = (sql: string) =>
      (sql.match(/\w+|[^\s\w]+/g) || [])
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

    // Step 2: get token lists
    // const origTokens = tokenize(origNorm);
    // const modTokens  = tokenize(modNorm);
    const origTokens = tokenize(minifySQL(baseQuery()));
    const modTokens = tokenize(minifySQL(editableQuery));
    // const diff = dmp.diff_main(origTokens.join(' '), modTokens.join(' '));
    const diff = dmp.diff_main(origTokens.join('\n'), modTokens.join('\n'));
    

    dmp.diff_cleanupSemantic(diff);

    // Step 4: rebuild HTML, *always* adding a trailing space*
    // const origTokens = tokenize(minifySQL(baseQuery()));
    // const modTokens = tokenize(minifySQL(editableQuery));

    // const diff = dmp.diff_main(origTokens.join('\n'), modTokens.join('\n'));
    // dmp.diff_cleanupSemantic(diff); // optional

    const html = diff
      .map(([op, txt]: [number, string]) => {
        const token = txt.replace(/\n/g, ' ');
        if (op === DiffMatchPatch.DIFF_INSERT) return `<b style="color:red;">${token}</b> `;
        if (op === DiffMatchPatch.DIFF_DELETE) return `<del style="color:red;">${token}</del> `;
        return `${token} `;
      })
      .join('')
      .trim();


    setFinalDiff(html);
  };
  const minifySQL = (sql: string): string =>
    sql
    .replace(/--.*$/gm, '')            // remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ' ')  // remove block comments
    .replace(/\s{2,}/g, ' ')              // collapse all whitespace
    .trim();
  const handleSubmit = async () => {
    const approvedBy = user === 'Others' ? (customUser || '').trim() || 'Unknown' : user;
    const selectedRow = queries.find(q => q.originalQuery === selectedQuery);
    const payload = {
      originalQuery: baseQuery(),
      prompt,
      modifiedQuery: editableQuery,
      submittedBy: approvedBy,
      bank: bank === 'Others' ? (customBank || '').trim() : bank,
      segment: segment === 'Others' ? (customSegment || '').trim() : segment,
      sheet1RowIndex: selectedRow?.rowIndex || null
    };
    try {
      const r = await fetch('/api/send-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const { status } = await r.json();
      alert(status === 'submitted' ? 'Submitted!' : 'Failed');
    } catch {
      alert('Network error');
    }
  };
  // inside SubmissionsPage, before the return:

  // derive an array of { ok, text } from the raw LLM output
  const checklist = (complianceResult || '')
    .split('\n')
    .filter(line => /^[-•*]\s+/.test(line.trim()))
    .map(line => ({
      text: line.replace(/^[-•*]\s+/, '').trim()
    }));




  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">SQL Query Modifier</h1>
        <Link href="/review">
          <button className="bg-blue-600 text-white px-3 py-1 rounded">Go to Review</button>
        </Link>
      </div>
      <a
        href="/"
        className="inline-block mb-4 text-blue-600 underline hover:text-blue-800"
      >
        ← Go to Home
      </a>
      <div className="flex justify-end">
        <button
        onClick = {() => window.location.reload()}
        className ="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
        > 
        🔄 Refresh
        </button>

      </div>
      
      {/* User */}
      
      <div className="mb-6">
        <label className="block font-semibold mb-2">User:</label>
        <div className="flex flex-wrap gap-2">
          {['Mohit', 'Bhaskar', 'Others'].map(name => (
            <button
              key={name}
              onClick={() => setUser(name)}
              className={`px-4 py-2 rounded border ${
                user === name
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

      {user === 'Others' && (
        <input
          type="text"
          placeholder="Your name"
          value={customUser}
          onChange={e => setCustomUser(e.target.value)}
          className="mt-2 border p-2 rounded w-full"
        />
      )}
      </div>
          
      
        
      {/* Bank */}
      <div className="mb-4">
        <label className="font-semibold">Select Bank:</label>
        <div className="flex flex-wrap gap-2">
          {bankList.map(b => (
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
      {/* Segment */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Select Segment:</label>

      <div className="flex flex-wrap gap-2">
        {filteredSegments.map(s => (
          <button
            key={s}
            onClick={() => setSegment(s)}
            className={`px-4 py-2 rounded ${
              segment === s ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}

      {/* “Others” option */}
        <button
          key="Others"
          onClick={() => setSegment('Others')}
          className={`px-4 py-2 rounded ${
            segment === 'Others' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Others
        </button>
      </div>

      {segment === 'Others' && (
        <input
          type="text"
          placeholder="Custom Segment"
          value={customSegment}
          onChange={e => setCustomSegment(e.target.value)}
          className="mt-2 w-full p-2 border rounded"
        />
      )}
      </div>

      
      {/* Edit result */}
      {modifiedQuery && (
        <div className="mt-6">
          <h2 className="font-semibold">Edit Modified Query</h2>
          <textarea
            ref={editRef}
            className="w-full p-2 border mt-2 resize-none overflow-hidden"
            value={editableQuery}
            onChange={e => { setEditableQuery(e.target.value); autoResize(); }}
            onInput={autoResize}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleFinal}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Preview Diff
            </button>
            <button
              onClick={handleSubmit}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Send for Approval
            </button>
            <button
              onClick={handleComplianceCheck}
              // onClick={() => handleComplianceCheck(item)}
              disabled={complianceLoading}
              className="bg-purple-600 text-white px-3 py-1 rounded"
            >
              {complianceLoading ? 'Checking…' : 'Compliance Check'}
            </button>
          </div>
        
        {/* Debug: show raw LLM output */}
        {/* {complianceResult && (
          <pre className="mb-4 p-2 bg-gray-100 text-sm text-gray-800">
            {complianceResult}
          </pre>
        )} */}
        {/* Styled checklist */}
          {checklist.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <strong className="block mb-2">Compliance Feedback:</strong>
              <div className="space-y-2">
                {checklist.map(({ text }, i) => (
                  <div key={i} className="flex items-center">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-800">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}




      </div>
      )}

      {/* Query selection */}

      
      {/* Diff preview */}
      {finalDiff && (
        <div className="mt-6">
          <h2 className="font-semibold">Final Diff</h2>
          <div
            className="bg-gray-100 p-4 rounded whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: finalDiff }}
          />
        </div>
      )}
    </div>
  )}
  
