"use client";
import { useState } from "react";
import Link from "next/link";

interface EarningsData {
  direct_answer: string;
  extracted_metrics: string[];
  confidence_level: string;
}

export default function EarningsRagDashboard() {
  const [documentText, setDocumentText] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim() || !query.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/finance/earnings-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          document_text: documentText,
          query: query
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.analysis);
      }
    } catch (err) {
      setError("Backend connection failed. Is your Python server running?");
    }
    
    setLoading(false);
  };

  const getConfidenceColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("high")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    if (l.includes("medium")) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <Link href="/finance" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
          <span>←</span> Back to Finance
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-3xl border border-indigo-200 dark:border-indigo-500/20">
            🧾
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Earnings Report RAG</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">AI Auditor: Extracts strict answers and key financial metrics directly from text excerpts.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={analyzeDocument} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Financial Document Excerpt
              </label>
              <textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="Paste earnings report paragraph here (e.g., 'In Q3, total revenue was $5.2 billion, an increase of 12% year-over-year...')"
                className="w-full h-48 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Your Audit Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What was the total revenue and how much did it grow?"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !documentText.trim() || !query.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Extracting Insights...</>
              ) : (
                "Run AI Audit"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Results Dashboard */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden">
          
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Header Info */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎯</span> Audit Results
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Confidence:</span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getConfidenceColor(data.confidence_level)}`}>
                    {data.confidence_level}
                  </span>
                </div>
              </div>

              {/* Direct Answer */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Direct Answer</h3>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5 rounded-xl">
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                    {data.direct_answer}
                  </p>
                </div>
              </div>

              {/* Extracted Metrics */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Key Metrics Extracted</h3>
                {data.extracted_metrics && data.extracted_metrics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.extracted_metrics.map((metric, i) => (
                      <div key={i} className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <span className="text-indigo-400">📈</span> {metric}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-4 rounded-xl">
                    No specific numbers or metrics found to answer this query.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-20 h-20 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-4xl grayscale opacity-50">
                🤖
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Document</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Provide a financial excerpt and ask a query to see the AI auditor extract facts and figures.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}