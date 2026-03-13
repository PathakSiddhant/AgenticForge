// Path: web-app/src/app/travel/vendor-negotiator/page.tsx
"use client";

import { useState } from "react";

export default function VendorNegotiator() {
  const [formData, setFormData] = useState({
    vendor_type: "",
    initial_quote: "",
    target_budget: "",
    leverage: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateScripts = async () => {
    if (!formData.vendor_type || !formData.initial_quote || !formData.target_budget) {
      setError("Please fill out all mandatory fields!");
      return;
    }
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/travel/vendor-negotiator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_type: formData.vendor_type,
          initial_quote: parseInt(formData.initial_quote),
          target_budget: parseInt(formData.target_budget),
          leverage: formData.leverage || "We are comparing multiple vendors right now."
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data.negotiation_plan);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <span className="px-3 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-500/20 mb-4 inline-block">
          Travel & Event Management
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          The Vendor Negotiator
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Draft psychological email scripts to lower quotes without compromising your professional relationship.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Vendor Type 🏢</label>
            <input 
              type="text" 
              placeholder="e.g., Wedding Caterer, DJ, Venue" 
              value={formData.vendor_type}
              onChange={(e) => setFormData({...formData, vendor_type: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Quote ($) 📉</label>
              <input 
                type="number" 
                placeholder="e.g., 5000"
                value={formData.initial_quote}
                onChange={(e) => setFormData({...formData, initial_quote: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Target ($) 🎯</label>
              <input 
                type="number" 
                placeholder="e.g., 4000"
                value={formData.target_budget}
                onChange={(e) => setFormData({...formData, target_budget: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Your Leverage 🔑</label>
            <textarea 
              placeholder="e.g., We have 3 more corporate events this year, or 'A competitor quoted $3800'." 
              rows={3}
              value={formData.leverage}
              onChange={(e) => setFormData({...formData, leverage: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button 
            onClick={generateScripts}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {loading ? "Drafting strategies..." : "Generate Email Scripts"}
          </button>

          {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
        </div>

        {/* RIGHT COLUMN: Results Dashboard */}
        <div className="lg:col-span-2">
          {!result && !loading && (
            <div className="h-full min-h-100 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a]">
              <span className="text-4xl mb-4 opacity-50">🤝</span>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Enter vendor details to draft negotiation scripts.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-100 flex flex-col items-center justify-center border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-[#111]">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Analyzing psychology & generating scripts...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animation-fade-in">
              
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1">Potential Savings</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">${result.savings_potential}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">3 Strategic Approaches Generated</p>
                </div>
              </div>

              <div className="space-y-6">
                {result.negotiation_scripts.map((script: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    {/* Script Header */}
                    <div className="bg-slate-50 dark:bg-[#1a1a1a] px-6 py-4 border-b border-slate-200 dark:border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-indigo-500">#{idx + 1}</span> {script.strategy_name}
                        </h3>
                        <button 
                          onClick={() => copyToClipboard(script.email_body, idx)}
                          className="text-xs font-semibold bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          {copiedIndex === idx ? "Copied! ✓" : "Copy Email"}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="font-bold text-indigo-500 dark:text-indigo-400">Psychology:</span> {script.psychology_used}
                      </p>
                    </div>
                    
                    {/* Email Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subject</span>
                        <p className="font-semibold text-slate-900 dark:text-white mt-1">{script.subject_line}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Body</span>
                        <div className="mt-2 p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-100 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                          {script.email_body}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}