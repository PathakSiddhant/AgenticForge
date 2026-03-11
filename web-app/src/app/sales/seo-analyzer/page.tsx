"use client";
import { useState } from "react";
import Link from "next/link";

interface SEOData {
  seo_score: number;
  keyword_analysis: string;
  missing_lsi_keywords: string[];
  actionable_tips: string[];
}

export default function SEOAnalyzerDashboard() {
  const [targetKeyword, setTargetKeyword] = useState("");
  const [articleText, setArticleText] = useState("");
  const [data, setData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetKeyword.trim() || !articleText.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/sales/seo-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          target_keyword: targetKeyword,
          article_text: articleText
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.audit);
      }
    } catch (err) {
      setError("AI Engine connection failed. Ensure your Python backend is running.");
    }
    
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/sales" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-6 transition-colors">
          <span>←</span> Back to Sales
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center text-3xl border border-cyan-200 dark:border-cyan-500/20">
            🔍
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">SEO Content Analyzer</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Audit your blog posts against target keywords to rank higher on Google.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={analyzeSEO} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Target Keyword
              </label>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g., Best AI Tools for Sales"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Article Content
              </label>
              <textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="Paste your blog post or article text here..."
                className="w-full h-64 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !targetKeyword.trim() || !articleText.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Auditing Content...</>
              ) : (
                "Run SEO Audit"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Scorecard Dashboard */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Scorecard Header */}
              <div className="flex items-center gap-6 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-6 rounded-xl shadow-sm">
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">SEO Score</span>
                  <div className={`text-5xl font-extrabold ${getScoreColor(data.seo_score)}`}>
                    {data.seo_score}<span className="text-xl text-slate-400">/100</span>
                  </div>
                </div>
                <div className="h-16 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Keyword Analysis</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {data.keyword_analysis}
                  </p>
                </div>
              </div>

              {/* Missing LSI Keywords */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🔑</span> Missing LSI Keywords
                </h3>
                <p className="text-xs text-slate-500 mb-3">Add these semantic keywords naturally to improve search relevance.</p>
                <div className="flex flex-wrap gap-2">
                  {data.missing_lsi_keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 rounded-lg text-sm font-medium">
                      + {kw}
                    </span>
                  ))}
                  {data.missing_lsi_keywords.length === 0 && (
                    <span className="text-sm text-emerald-500 italic">Great job! No major LSI keywords missing.</span>
                  )}
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-5 mt-4">
                <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm mb-4 flex items-center gap-2">
                  <span>🛠️</span> Actionable SEO Tips
                </h4>
                <ul className="space-y-3">
                  {data.actionable_tips.map((tip, i) => (
                    <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-3">
                      <span className="text-amber-500 font-bold mt-0.5">{i+1}.</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                📊
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Content</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Enter your target keyword and article text to generate a comprehensive SEO audit.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}