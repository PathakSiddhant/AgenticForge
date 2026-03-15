"use client";
import { useState } from "react";
import Link from "next/link";

export default function JsonStructurer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFormat = async () => {
    if (!input) return;
    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await res.json();
      setOutput(data.structured_data); 
    } catch (error) {
      setOutput({ error: "Backend se connect nahi ho paya bhai. Python server on hai?" });
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Link href="/sandbox" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
        <span>←</span> Back to Sandbox
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-2xl border border-orange-200 dark:border-orange-500/20">
            🧱
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Data Structurer AI</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Enter raw, unstructured text. The AI will extract the key entities and return a strictly formatted JSON object.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Raw Input (Text)</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'John Doe is a 28 year old software engineer living in New York. He knows Python, JavaScript, and loves playing guitar.'"
            className="flex-1 w-full min-h-75 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 resize-none transition-colors"
          />
          <button
            onClick={handleFormat}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : "Generate JSON"}
          </button>
        </div>

        {/* Output Panel (Fixed for Light Mode) */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-inner transition-colors">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Structured Output (JSON)</h2>
          <div className="flex-1 w-full min-h-75 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-auto relative transition-colors">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : output ? (
              <pre className="text-sm font-mono text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">
                {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              <p className="text-slate-400 dark:text-slate-600 font-mono text-sm">{"// Output will appear here..."}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}