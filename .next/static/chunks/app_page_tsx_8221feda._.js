(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$diff$2d$match$2d$patch$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/diff-match-patch/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sql$2d$formatter$2f$dist$2f$esm$2f$sqlFormatter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sql-formatter/dist/esm/sqlFormatter.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function Home() {
    _s();
    const [queries, setQueries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedQuery, setSelectedQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [customQuery, setCustomQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [prompt, setPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [modifiedQuery, setModifiedQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editableQuery, setEditableQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [finalDiff, setFinalDiff] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [formatOnly, setFormatOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const editBoxRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Mohit');
    const [customUser, setCustomUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [bankList, setBankList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [fullSegmentList, setFullSegmentList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [filteredSegmentList, setFilteredSegmentList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedBank, setSelectedBank] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [customBank, setCustomBank] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedSegment, setSelectedSegment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [customSegment, setCustomSegment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            fetch('/api/fetch-bank-segment').then({
                "Home.useEffect": (res)=>res.json()
            }["Home.useEffect"]).then({
                "Home.useEffect": (data)=>{
                    setBankList(data.bankNames || []);
                    setFullSegmentList(data.segmentMapping || []);
                }
            }["Home.useEffect"]);
        }
    }["Home.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (selectedBank && selectedBank !== 'Others') {
                const segments = fullSegmentList.filter({
                    "Home.useEffect.segments": (item)=>item.bank === selectedBank
                }["Home.useEffect.segments"]).map({
                    "Home.useEffect.segments": (item)=>item.segment
                }["Home.useEffect.segments"]);
                setFilteredSegmentList([
                    ...new Set(segments)
                ]);
            } else {
                setFilteredSegmentList([]);
            }
            setSelectedSegment('');
            setQueries([]);
        }
    }["Home.useEffect"], [
        selectedBank,
        fullSegmentList
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            const bankToSend = selectedBank === 'Others' ? customBank : selectedBank;
            const segmentToSend = selectedSegment === 'Others' ? customSegment : selectedSegment;
            if (bankToSend && segmentToSend) {
                fetch(`/api/fetch-queries?bank=${encodeURIComponent(bankToSend)}&segment=${encodeURIComponent(segmentToSend)}`).then({
                    "Home.useEffect": (res)=>res.json()
                }["Home.useEffect"]).then({
                    "Home.useEffect": (data)=>{
                        if (Array.isArray(data)) {
                            setQueries(data);
                        } else {
                            setQueries([]);
                        }
                    }
                }["Home.useEffect"]).catch({
                    "Home.useEffect": (err)=>{
                        console.error('Error fetching filtered queries:', err);
                        setQueries([]);
                    }
                }["Home.useEffect"]);
            }
        }
    }["Home.useEffect"], [
        selectedBank,
        selectedSegment,
        customBank,
        customSegment
    ]);
    const getBaseQuery = ()=>customQuery.trim() !== '' ? customQuery : selectedQuery;
    const autoResize = ()=>{
        if (editBoxRef.current) {
            editBoxRef.current.style.height = 'auto';
            editBoxRef.current.style.height = editBoxRef.current.scrollHeight + 'px';
        }
    };
    const handleSendForApproval = async ()=>{
        try {
            const res = await fetch('/api/send-for-approval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    originalQuery: getBaseQuery(),
                    prompt,
                    modifiedQuery: editableQuery,
                    submittedBy: user === 'Others' ? customUser : user,
                    bank: selectedBank === 'Others' ? customBank : selectedBank,
                    segment: selectedSegment === 'Others' ? customSegment : selectedSegment
                })
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
    const handleGenerate = async ()=>{
        setLoading(true);
        setFinalDiff('');
        const originalQuery = getBaseQuery();
        try {
            if (formatOnly) {
                const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sql$2d$formatter$2f$dist$2f$esm$2f$sqlFormatter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["format"])(originalQuery);
                setModifiedQuery(formatted);
                setEditableQuery(formatted);
                return;
            }
            const res = await fetch('/api/modify-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    originalQuery,
                    prompt
                })
            });
            const data = await res.json();
            const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sql$2d$formatter$2f$dist$2f$esm$2f$sqlFormatter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["format"])(data.modifiedQuery || '');
            setModifiedQuery(formatted);
            setEditableQuery(formatted);
        } catch  {
            setModifiedQuery('Error contacting LLM API');
        } finally{
            setLoading(false);
        }
    };
    const handleFinalSubmit = ()=>{
        const original = getBaseQuery();
        const minifiedNew = minifySQL(editableQuery || '');
        const minifiedOriginal = minifySQL(original);
        const diff = highlightDiff(minifiedOriginal, minifiedNew);
        setFinalDiff(diff);
    };
    const normalizeSQL = (query)=>query.replace(/\s+/g, ' ').replace(/["“”]/g, "'").trim();
    const highlightDiff = (original, modified)=>{
        const dmp = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$diff$2d$match$2d$patch$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
        const cleanOriginal = normalizeSQL(original);
        const cleanModified = normalizeSQL(modified);
        const diff = dmp.diff_main(cleanOriginal, cleanModified);
        dmp.diff_cleanupSemantic(diff);
        return diff.map(([type, text])=>{
            if (type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$diff$2d$match$2d$patch$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].DIFF_INSERT) return `<b>${text}</b>`;
            if (type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$diff$2d$match$2d$patch$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].DIFF_DELETE) return `<del>${text}</del>`;
            return text;
        }).join('');
    };
    const minifySQL = (query)=>query.replace(/\s+/g, ' ').replace(/\s*\n\s*/g, ' ').trim();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 max-w-3xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-xl font-bold mb-4",
                children: "SQL Query Modifier"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 168,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "font-semibold",
                        children: "Select User:"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: user,
                        onChange: (e)=>setUser(e.target.value),
                        className: "w-full p-2 border mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "Mohit",
                                children: "Mohit"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "Bhaskar",
                                children: "Bhaskar"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "Prerna",
                                children: "Prerna"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "Others",
                                children: "Others"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this),
                    user === 'Others' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Enter your name",
                        value: customUser,
                        onChange: (e)=>setCustomUser(e.target.value),
                        className: "w-full p-2 border"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "font-semibold",
                        children: "Select Bank Name:"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedBank,
                        onChange: (e)=>setSelectedBank(e.target.value),
                        className: "w-full p-2 border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "-- Select Bank --"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this),
                            bankList.map((b, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: b,
                                    children: b
                                }, i, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 201,
                                    columnNumber: 35
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "Others",
                                children: "Others"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    selectedBank === 'Others' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Enter custom bank",
                        value: customBank,
                        onChange: (e)=>setCustomBank(e.target.value),
                        className: "w-full p-2 border mt-2"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "font-semibold",
                        children: "Select Segment:"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 216,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: selectedSegment,
                        onChange: (e)=>setSelectedSegment(e.target.value),
                        className: "w-full p-2 border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "-- Select Segment --"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this),
                            filteredSegmentList.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: s,
                                    children: s
                                }, i, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 223,
                                    columnNumber: 46
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "Others",
                                children: "Others"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 217,
                        columnNumber: 9
                    }, this),
                    selectedSegment === 'Others' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Enter custom segment",
                        value: customSegment,
                        onChange: (e)=>setCustomSegment(e.target.value),
                        className: "w-full p-2 border mt-2"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 227,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 215,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "font-semibold",
                children: "Select an approved query:"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 237,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                onChange: (e)=>setSelectedQuery(e.target.value),
                className: "w-full mb-4 p-2 border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        children: "-- Select Approved Query --"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this),
                    Array.isArray(queries) && queries.length > 0 ? queries.map((q, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: q.originalQuery,
                            children: q.originalQuery
                        }, i, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 245,
                            columnNumber: 13
                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        disabled: true,
                        children: "No approved queries found"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 248,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "font-semibold",
                children: "Or paste your own query:"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                value: customQuery,
                onChange: (e)=>setCustomQuery(e.target.value),
                placeholder: "Paste your SQL query here...",
                className: "w-full mb-4 p-2 border h-20"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 253,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "font-semibold",
                children: "Instruction / Prompt:"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 260,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                value: prompt,
                onChange: (e)=>setPrompt(e.target.value),
                placeholder: "What change do you want to make to the query?",
                className: "w-full mb-4 p-2 border h-20"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 261,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "flex items-center mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        className: "mr-2",
                        checked: formatOnly,
                        onChange: (e)=>setFormatOnly(e.target.checked)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 269,
                        columnNumber: 9
                    }, this),
                    "Only format query without changes"
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 268,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleGenerate,
                disabled: loading,
                className: "bg-blue-600 text-white px-4 py-2 rounded",
                children: loading ? 'Modifying...' : 'Generate Modified Query'
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 278,
                columnNumber: 7
            }, this),
            modifiedQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-bold",
                        children: "Edit Modified Query"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 288,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        ref: editBoxRef,
                        value: editableQuery,
                        onChange: (e)=>{
                            setEditableQuery(e.target.value);
                            autoResize();
                        },
                        className: "w-full p-2 border mt-2 overflow-hidden resize-none",
                        onInput: autoResize
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 289,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleFinalSubmit,
                                className: "mt-3 bg-green-600 text-white px-4 py-2 rounded",
                                children: "Submit Final"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 300,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSendForApproval,
                                className: "mt-3 bg-yellow-500 text-white px-4 py-2 rounded",
                                children: "Send for Approval"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 306,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 299,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 287,
                columnNumber: 9
            }, this),
            finalDiff && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-bold",
                        children: "Final Query with Highlighted Changes"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 318,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-100 p-4 rounded whitespace-pre-wrap text-black",
                        dangerouslySetInnerHTML: {
                            __html: finalDiff
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 319,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 317,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 167,
        columnNumber: 5
    }, this);
}
_s(Home, "4Wykb5iQWGLcC+TpO/hTdKpOG+I=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=app_page_tsx_8221feda._.js.map