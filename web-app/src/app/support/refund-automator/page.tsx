"use client";
import { useState } from "react";
import Link from "next/link";

interface RefundData {
  decision: string;
  reasoning: string;
  customer_response: string;
  refund_amount: number;
}

export default function RefundAutomatorDashboard() {
  const [customerReason, setCustomerReason] = useState("");
  const [daysSincePurchase, setDaysSincePurchase] = useState<number | "">("");
  const [purchaseAmount, setPurchaseAmount] = useState<number | "">("");
  const [companyPolicy, setCompanyPolicy] = useState("Full refund allowed within 30 days of purchase. No refunds after 30 days under any circumstances. Physical damage by customer is not covered.");
  
  const [data, setData] = useState<RefundData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processRMA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerReason.trim() || daysSincePurchase === "" || purchaseAmount === "") return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/support/refund-automator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customer_reason: customerReason,
          days_since_purchase: Number(daysSincePurchase),
          purchase_amount: Number(purchaseAmount),
          company_policy: companyPolicy
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.rma_decision);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  const getDecisionColor = (decision: string) => {
    const d = decision.toLowerCase();
    if (d.includes("approved")) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20";
    if (d.includes("rejected")) return "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20";
    return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/support" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-6 transition-colors">
          <span>←</span> Back to Support
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-3xl border border-violet-200 dark:border-violet-500/20">
            💸
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Refund & RMA Automator</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Strict, objective AI decision engine for processing customer refunds.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={processRMA} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Purchase Amount ($)
                </label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 299"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Days Since Purchase
                </label>
                <input
                  type="number"
                  value={daysSincePurchase}
                  onChange={(e) => setDaysSincePurchase(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 14"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Strict Company Policy
              </label>
              <textarea
                value={companyPolicy}
                onChange={(e) => setCompanyPolicy(e.target.value)}
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Customer Reason for Refund
              </label>
              <textarea
                value={customerReason}
                onChange={(e) => setCustomerReason(e.target.value)}
                placeholder="e.g., I just didn't like the color when it arrived."
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !customerReason.trim() || daysSincePurchase === "" || purchaseAmount === ""}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing RMA...</>
              ) : (
                "Process Refund Request"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Decision Dashboard */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Top Row: Decision & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm ${getDecisionColor(data.decision)}`}>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Final Decision</span>
                  <div className="text-2xl font-black uppercase tracking-tight">{data.decision}</div>
                </div>
                
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Refund Amount</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ${data.refund_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Internal Reasoning */}
              <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: '#8b5cf6' }}>
                <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span>🧠</span> AI Internal Reasoning
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {data.reasoning}
                </p>
              </div>

              {/* Customer Response Draft */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>✉️</span> Customer Response Draft
                </h3>
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-sm">
                  {data.customer_response}
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                ⚖️
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Request</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Enter purchase details and the customer&apos;s reason to automate the RMA decision.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}