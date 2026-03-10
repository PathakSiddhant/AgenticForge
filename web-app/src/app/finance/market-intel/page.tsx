"use client";
import { useState } from "react";
import Link from "next/link";

// TypeScript interface taaki hume errors na aayein
interface MarketIntelData {
  company_name: string;
  industry: string;
  market_sentiment: string;
  key_competitors: string[];
  swot_analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  executive_summary: string;
}

export default function MarketIntelDashboard() {
  const [company, setCompany] = useState("");
  const [data, setData] = useState<MarketIntelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/finance/intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: company }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.intel);
      }
    } catch (err) {
      setError("Backend se connect nahi ho paya. Is your Python server running?");
    }
    
    setLoading(false);
  };

  // Sentiment ke hisaab se color decide karna
  const getSentimentColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes("bullish") || s.includes("positive")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    if (s.includes("bearish") || s.includes("negative")) return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
    return "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <span>←</span> Back to Marketplace
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-3xl border border-blue-200 dark:border-blue-500/20">
            📈
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Market Intel Agent</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">AI-powered deep dive into any company&apos;s market position, competitors, and SWOT analysis.</p>
          </div>
        </div>
      </div>

      {/* Search/Input Bar */}
      <form onSubmit={analyzeMarket} className="mb-10 flex gap-4 bg-white dark:bg-[#111] p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Enter a company name (e.g., Tesla, Zomato, OpenAI, Quick Smart Wash)..."
          className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-900 dark:text-white placeholder-slate-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !company.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
          ) : (
            "Generate Report"
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-8 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* The Analytics Dashboard (Visible only when data arrives) */}
      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Top Row: Quick Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Company Info Card */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{data.company_name}</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{data.industry}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getSentimentColor(data.market_sentiment)}`}>
                  {data.market_sentiment}
                </span>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Executive Summary</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{data.executive_summary}</p>
              </div>
            </div>

            {/* Competitors Card */}
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300 mb-4 flex items-center gap-2">
                <span>⚔️</span> Top Competitors
              </h3>
              <ul className="space-y-3">
                {data.key_competitors.map((comp, i) => (
                  <li key={i} className="bg-slate-50 dark:bg-[#1a1a1a] border border-slate-100 dark:border-white/5 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs">{i + 1}</span>
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Row: SWOT Analysis Grid */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-10 mb-4 flex items-center gap-2">
            <span>🎯</span> Comprehensive SWOT Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-emerald-50/50 dark:bg-[#111] border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                <span>💪</span> Strengths
              </h4>
              <ul className="space-y-2 relative z-10">
                {data.swot_analysis.strengths.map((item, i) => (
                  <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50/50 dark:bg-[#111] border border-red-100 dark:border-red-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
              <h4 className="text-red-700 dark:text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
                <span>⚠️</span> Weaknesses
              </h4>
              <ul className="space-y-2 relative z-10">
                {data.swot_analysis.weaknesses.map((item, i) => (
                  <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-50/50 dark:bg-[#111] border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <h4 className="text-blue-700 dark:text-blue-400 font-bold text-lg mb-4 flex items-center gap-2">
                <span>🚀</span> Opportunities
              </h4>
              <ul className="space-y-2 relative z-10">
                {data.swot_analysis.opportunities.map((item, i) => (
                  <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-orange-50/50 dark:bg-[#111] border border-orange-100 dark:border-orange-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
              <h4 className="text-orange-700 dark:text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
                <span>🔥</span> Threats
              </h4>
              <ul className="space-y-2 relative z-10">
                {data.swot_analysis.threats.map((item, i) => (
                  <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}