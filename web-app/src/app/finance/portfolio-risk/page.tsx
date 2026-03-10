"use client";
import { useState } from "react";
import Link from "next/link";

interface RiskData {
  overall_risk_score: number;
  risk_category: string;
  diversity_health: string;
  vulnerabilities: string[];
  rebalancing_recommendations: string[];
}

export default function PortfolioRiskDashboard() {
  const [holdings, setHoldings] = useState("");
  const [marketOutlook, setMarketOutlook] = useState("Neutral Market");
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdings.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/finance/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          holdings: holdings,
          market_outlook: marketOutlook
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.analysis);
      }
    } catch (err) {
      setError("Backend se connect nahi ho paya bhai. Python server chal raha hai?");
    }
    
    setLoading(false);
  };

  // Score ke hisaab se color dynamic karna
  const getScoreColor = (score: number) => {
    if (score < 40) return "text-emerald-500"; // Safe
    if (score < 70) return "text-amber-500";   // Warning
    return "text-red-500";                     // Danger
  };

  const getScoreBg = (score: number) => {
    if (score < 40) return "bg-emerald-500"; 
    if (score < 70) return "bg-amber-500";   
    return "bg-red-500";                     
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <Link href="/finance" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors">
          <span>←</span> Back to Finance
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-3xl border border-purple-200 dark:border-purple-500/20">
            ⚖️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Portfolio Risk Analyzer</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Institutional-grade risk assessment and rebalancing strategy for any asset mix.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Input Parameters</h2>
          <form onSubmit={analyzeRisk} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Holdings (Assets & %)
              </label>
              <textarea
                value={holdings}
                onChange={(e) => setHoldings(e.target.value)}
                placeholder="e.g., 40% Nifty50, 30% Bitcoin, 20% Gold, 10% Cash"
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Market Outlook
              </label>
              <select
                value={marketOutlook}
                onChange={(e) => setMarketOutlook(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 text-sm"
                disabled={loading}
              >
                <option value="Bullish (Expecting Growth)">Bullish (Expecting Growth)</option>
                <option value="Neutral Market">Neutral Market</option>
                <option value="Bearish (Expecting Recession/Crash)">Bearish (Expecting Recession/Crash)</option>
                <option value="Highly Volatile/Uncertain">Highly Volatile/Uncertain</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !holdings.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Calculating...</>
              ) : (
                "Run Risk Analysis"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: The Dashboard */}
        <div className="lg:col-span-2">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Top Row: Score & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Overall Risk Score</p>
                  <div className={`text-6xl font-extrabold mb-2 ${getScoreColor(data.overall_risk_score)}`}>
                    {data.overall_risk_score}<span className="text-2xl text-slate-400">/100</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getScoreBg(data.overall_risk_score)} transition-all duration-1000`} 
                      style={{ width: `${data.overall_risk_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Risk Classification</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{data.risk_category}</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 mt-2">Diversity Health</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{data.diversity_health}</p>
                </div>
              </div>

              {/* Bottom Row: Vulnerabilities & Recommendations */}
              <div className="grid grid-cols-1 gap-6">
                
                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-6">
                  <h4 className="text-red-700 dark:text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
                    <span>🚨</span> Critical Vulnerabilities
                  </h4>
                  <ul className="space-y-3">
                    {data.vulnerabilities.map((item, i) => (
                      <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-red-100/50 dark:border-red-500/10">
                        <span className="text-red-500 mt-0.5 font-bold">{i+1}.</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 rounded-2xl p-6">
                  <h4 className="text-purple-700 dark:text-purple-400 font-bold text-lg mb-4 flex items-center gap-2">
                    <span>💡</span> Rebalancing Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {data.rebalancing_recommendations.map((item, i) => (
                      <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-purple-100/50 dark:border-purple-500/10">
                        <span className="text-purple-500 mt-0.5 font-bold">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-10">
              <div className="text-5xl mb-4 grayscale opacity-50">📊</div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Waiting for Portfolio Data</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mt-2">Enter your current asset allocation and market outlook on the left to generate a comprehensive risk analysis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}