"use client";
import { useState } from "react";
import Link from "next/link";

interface RoutingData {
  category: string;
  urgency_level: string;
  assigned_department: string;
  one_line_summary: string;
  escalation_required: boolean;
}

export default function TicketRouterDashboard() {
  const [customerMessage, setCustomerMessage] = useState("");
  const [data, setData] = useState<RoutingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/support/ticket-router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customer_message: customerMessage
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.routing);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  const getUrgencyColor = (urgency: string) => {
    const u = urgency.toLowerCase();
    if (u.includes("critical")) return "bg-red-500 text-white";
    if (u.includes("high")) return "bg-orange-500 text-white";
    if (u.includes("medium")) return "bg-amber-400 text-slate-900";
    return "bg-emerald-500 text-white";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/support" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors">
          <span>←</span> Back to Support
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center text-3xl border border-teal-200 dark:border-teal-500/20">
            🗂️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Omni-Channel Ticket Router</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">AI-powered triage to instantly categorize and assign customer issues.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={routeTicket} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Raw Customer Message
              </label>
              <textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Paste the angry, confusing, or lengthy email from the customer here..."
                className="w-full h-64 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !customerMessage.trim()}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Routing Ticket...</>
              ) : (
                "Analyze & Route Ticket"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Triage Output */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-100">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Summary & Escalation Alert */}
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm">
                {data.escalation_required && (
                  <div className="mb-4 bg-red-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded inline-flex items-center gap-2 animate-pulse">
                    <span>🚨</span> ESCALATION REQUIRED
                  </div>
                )}
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Issue Summary</h3>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  &quot;{data.one_line_summary}&quot;
                </p>
              </div>

              {/* Triage Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{data.category}</span>
                </div>
                
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Urgency Level</span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getUrgencyColor(data.urgency_level)}`}>
                    {data.urgency_level}
                  </span>
                </div>
              </div>

              {/* Routing Assignment */}
              <div className="bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-500/20 rounded-xl p-5 mt-4">
                <h4 className="text-teal-800 dark:text-teal-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <span>🎯</span> Route To Department
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-200 dark:bg-teal-800 flex items-center justify-center text-teal-800 dark:text-teal-200">
                    🏢
                  </div>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {data.assigned_department}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                📥
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Ticket</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Paste a customer message to instantly triage and assign it to the right team.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}