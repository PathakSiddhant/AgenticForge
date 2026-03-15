"use client";
import { useState } from "react";
import Link from "next/link";

interface ResponderData {
  draft_reply: string;
  tone_used: string;
  policy_followed: string;
  needs_human_review: boolean;
}

export default function AutoResponderDashboard() {
  const [customerName, setCustomerName] = useState("");
  const [companyPolicy, setCompanyPolicy] = useState("Standard refund policy is 30 days from purchase. No exceptions unless product is defective.");
  const [customerMessage, setCustomerMessage] = useState("");
  const [data, setData] = useState<ResponderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim() || !companyPolicy.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/support/auto-responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customer_name: customerName || "Customer",
          company_policy: companyPolicy,
          customer_message: customerMessage
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.response_draft);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Draft copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/support" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
          <span>←</span> Back to Support
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-3xl border border-indigo-200 dark:border-indigo-500/20">
            ✍️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Empathetic Auto-Responder</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Draft polite, policy-compliant email responses in seconds.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={generateReply} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Sarah Jenkins"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Relevant Company Policy
              </label>
              <textarea
                value={companyPolicy}
                onChange={(e) => setCompanyPolicy(e.target.value)}
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Customer Message
              </label>
              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Paste the customer's question or complaint here..."
                className="w-full h-40 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !customerMessage.trim() || !companyPolicy.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Drafting Reply...</>
              ) : (
                "Generate Draft"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Draft Dashboard */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Human Review Warning */}
              {data.needs_human_review && (
                <div className="bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Human Review Required</h4>
                    <p className="text-xs text-amber-800 dark:text-amber-500/80 mt-1">This request contradicts policy or is highly sensitive. Please review the draft carefully before sending.</p>
                  </div>
                </div>
              )}

              {/* Info Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Tone Applied</span>
                  <span className="font-semibold text-sm text-indigo-700 dark:text-indigo-400">{data.tone_used}</span>
                </div>
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Policy Enforcement</span>
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{data.policy_followed}</span>
                </div>
              </div>

              {/* The Draft Email */}
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-100 dark:bg-white/5 px-5 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 ml-2">Draft Reply</span>
                  </div>
                  <button onClick={() => copyToClipboard(data.draft_reply)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors flex items-center gap-1">
                    <span>📋</span> Copy 
                  </button>
                </div>
                <div className="p-6 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {data.draft_reply}
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                🤖
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Message</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Paste a customer message to generate a polite, policy-compliant email response.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}