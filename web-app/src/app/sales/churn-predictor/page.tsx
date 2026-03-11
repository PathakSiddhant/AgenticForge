"use client";
import { useState } from "react";
import Link from "next/link";

interface ChurnData {
  churn_risk: string;
  sentiment_analysis: string;
  key_frustrations: string[];
  retention_strategy: string;
}

export default function ChurnPredictorDashboard() {
  const [customerTenure, setCustomerTenure] = useState("");
  const [customerHistory, setCustomerHistory] = useState("");
  const [data, setData] = useState<ChurnData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeChurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerHistory.trim() || !customerTenure.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/sales/churn-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customer_tenure: customerTenure,
          customer_history: customerHistory
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.prediction);
      }
    } catch (err) {
      setError("AI Engine connection failed. Ensure your Python backend is running.");
    }
    
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    const r = risk.toLowerCase();
    if (r.includes("high")) return "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20";
    if (r.includes("medium")) return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20";
    return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/sales" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 mb-6 transition-colors">
          <span>←</span> Back to Sales
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-3xl border border-rose-200 dark:border-rose-500/20">
            📉
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Churn Predictor</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Analyze support conversations to predict and prevent subscription cancellations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={analyzeChurn} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Customer Tenure
              </label>
              <input
                type="text"
                value={customerTenure}
                onChange={(e) => setCustomerTenure(e.target.value)}
                placeholder="e.g., 3 months, 2 years"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Support Ticket History / Chat Logs
              </label>
              <textarea
                value={customerHistory}
                onChange={(e) => setCustomerHistory(e.target.value)}
                placeholder="Paste the recent emails or support chats from this customer..."
                className="w-full h-64 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !customerHistory.trim() || !customerTenure.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing Risk...</>
              ) : (
                "Predict Churn Risk"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Analytics Dashboard */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Risk Alert Box */}
              <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm ${getRiskColor(data.churn_risk)}`}>
                <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Predicted Churn Risk</span>
                <div className="text-5xl font-black uppercase tracking-tight">{data.churn_risk}</div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>🧠</span> Customer Sentiment
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  &quot;{data.sentiment_analysis}&quot;
                </p>
              </div>

              {/* Key Frustrations */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>⚠️</span> Key Frustrations
                </h3>
                <ul className="space-y-2">
                  {data.key_frustrations.map((pain, i) => (
                    <li key={i} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-3 rounded-lg shadow-sm text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3 border-l-4 hover:-translate-y-0.5 transition-transform" style={{ borderLeftColor: '#f43f5e' }}>
                      <span className="font-bold text-rose-500 opacity-50 mt-0.5">{i+1}.</span>
                      <span className="leading-relaxed">{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Retention Strategy */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-5 mt-4">
                <h4 className="text-blue-800 dark:text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <span>🛡️</span> Recommended Retention Strategy
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.retention_strategy}
                </p>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                🚨
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Support Data</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Paste recent customer communications to analyze their sentiment and predict churn risk.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}