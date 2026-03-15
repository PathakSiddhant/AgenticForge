"use client";
import { useState } from "react";
import Link from "next/link";

interface RiskData {
  overall_risk_score: number;
  risk_level: string;
  identified_red_flags: string[];
  strategic_recommendation: string;
}

export default function SupplierRiskDashboard() {
  const [supplierName, setSupplierName] = useState("");
  const [contractTerms, setContractTerms] = useState("");
  const [pastHistory, setPastHistory] = useState("");
  
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !contractTerms.trim() || !pastHistory.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/logistics/supplier-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          supplier_name: supplierName,
          contract_terms: contractTerms,
          past_performance_history: pastHistory
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.evaluation);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-orange-500";
    return "text-emerald-500";
  };

  const getRiskBadgeColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("critical") || l.includes("high")) return "bg-red-500 text-white animate-pulse";
    if (l.includes("medium")) return "bg-orange-500 text-white";
    return "bg-emerald-500 text-white";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/logistics" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 mb-6 transition-colors">
          <span>←</span> Back to Logistics
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-3xl border border-orange-200 dark:border-orange-500/20">
            🚚
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Supplier Risk Evaluator</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Audit vendor contracts and past performance to identify hidden supply chain risks.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={runAudit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Supplier / Vendor Name
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g., Global Packaging Solutions Inc."
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Key Contract / SLA Terms
              </label>
              <textarea
                value={contractTerms}
                onChange={(e) => setContractTerms(e.target.value)}
                placeholder="Paste key clauses here. e.g., 'Vendor guarantees delivery within 14 days. No financial penalty applies if delays are under 5 days...'"
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Past Performance History
              </label>
              <textarea
                value={pastHistory}
                onChange={(e) => setPastHistory(e.target.value)}
                placeholder="e.g., Last 3 orders were delayed by 4 days, 2 days, and 6 days. Quality of batch #42 was slightly degraded."
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !supplierName.trim() || !contractTerms.trim() || !pastHistory.trim()}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Auditing Vendor...</>
              ) : (
                "Run Risk Audit"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Audit Dashboard */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Top Row: Score & Risk Level */}
              <div className="flex items-center gap-6 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-6 rounded-xl shadow-sm">
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Score</span>
                  <div className={`text-5xl font-extrabold ${getScoreColor(data.overall_risk_score)}`}>
                    {data.overall_risk_score}<span className="text-xl text-slate-400">/100</span>
                  </div>
                </div>
                <div className="h-16 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Threat Level</h3>
                  <div className={`inline-flex px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider shadow-sm ${getRiskBadgeColor(data.risk_level)}`}>
                    {data.risk_level} Risk
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Score {">"} 70 requires immediate procurement intervention.</p>
                </div>
              </div>

              {/* Identified Red Flags */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🚩</span> Critical Red Flags Identified
                </h3>
                <ul className="space-y-3">
                  {data.identified_red_flags.map((flag, i) => (
                    <li key={i} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3 border-l-4 hover:-translate-y-0.5 transition-transform" style={{ borderLeftColor: '#ef4444' }}>
                      <span className="font-bold text-red-500 mt-0.5">⚠️</span>
                      <span className="leading-relaxed font-medium">{flag}</span>
                    </li>
                  ))}
                  {data.identified_red_flags.length === 0 && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                      No major red flags detected. Vendor appears safe.
                    </div>
                  )}
                </ul>
              </div>

              {/* Strategic Recommendation */}
              <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-xl p-5 mt-4">
                <h4 className="text-orange-800 dark:text-orange-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <span>🛡️</span> Strategic Recommendation
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {data.strategic_recommendation}
                </p>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                ⚖️
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Supplier Data</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Paste contract clauses and delivery history to instantly audit vendor reliability.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}