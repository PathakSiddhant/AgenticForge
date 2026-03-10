"use client";
import { useState } from "react";
import Link from "next/link";

export default function ToolCaller() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!input) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:8000/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await res.json();
      setResponse(data.reply || data.error); 
    } catch (error) {
      setResponse("Backend se connect nahi ho paya bhai. Python server on hai?");
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Link href="/sandbox" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-8 transition-colors">
        <span>←</span> Back to Sandbox
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center text-2xl border border-cyan-200 dark:border-cyan-500/20">
            🛠️
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Action Executor AI (Tool Calling)</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Ask general questions, or ask for the price of Bitcoin, Ethereum, Solana, or Dogecoin to watch the AI trigger the internal Python function.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Your Command</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'What is Agentic AI?' or 'Fetch the current price of Ethereum please!'"
            className="flex-1 w-full min-h-50 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
          />
          <button
            onClick={handleAction}
            disabled={loading}
            className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Executing..." : "Send to AI"}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-inner transition-colors">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🤖</span> AI Response
          </h2>
          <div className="flex-1 w-full min-h-50 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-auto relative transition-colors">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-cyan-600 dark:border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : response ? (
              <p className="text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {response}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-600 font-mono text-sm">Waiting for your command...</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}