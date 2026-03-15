// Path: web-app/src/app/travel/crisis-manager/page.tsx
"use client";

import { useState } from "react";

export default function CrisisManager() {
  const [formData, setFormData] = useState({
    event_type: "",
    crisis_description: "",
    current_status: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateCrisisPlan = async () => {
    if (!formData.event_type || !formData.crisis_description || !formData.current_status) {
      setError("Please fill out all fields so we can accurately assess the threat level.");
      return;
    }
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/travel/crisis-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data.crisis_plan);
    } catch (err: any) {
      setError(err.message || "Failed to generate crisis plan.");
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(result.guest_communication_template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <span className="px-3 py-1 text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-500/20 mb-4 inline-block">
          Travel & Event Management
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Event Crisis Manager
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Input your emergency details to instantly receive a structured mitigation plan and communication templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-[#111] border border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 shadow-sm h-fit">
          
          <div className="flex items-center gap-2 mb-2">
             <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
             <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Emergency Intake</h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Event Type 🎪</label>
            <input 
              type="text" 
              placeholder="e.g., Outdoor Wedding, Corporate Summit" 
              value={formData.event_type}
              onChange={(e) => setFormData({...formData, event_type: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">What went wrong? 🚨</label>
            <textarea 
              placeholder="e.g., Heavy rain started unexpectedly, the main tent is leaking." 
              rows={3}
              value={formData.crisis_description}
              onChange={(e) => setFormData({...formData, crisis_description: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* 🌟 YAHAN NAYA CHANGE HAI: Input ko hata kar lamba Textarea kar diya! */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Current Status ⏱️</label>
            <textarea 
              placeholder="e.g., Guests are arriving in 10 minutes, caterers are stuck in traffic, and there is no backup power." 
              rows={3}
              value={formData.current_status}
              onChange={(e) => setFormData({...formData, current_status: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <button 
            onClick={generateCrisisPlan}
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
          >
            {loading ? "Analyzing Threat Level..." : "Generate Action Plan"}
          </button>

          {error && <p className="text-rose-500 text-sm font-medium mt-2">{error}</p>}
        </div>

        {/* RIGHT COLUMN: Results Dashboard */}
        <div className="lg:col-span-2">
          {!result && !loading && (
            <div className="h-full min-h-100 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a]">
              <span className="text-4xl mb-4 opacity-50">🛡️</span>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-sm">Stay calm. Enter the details on the left, and the AI will generate a structured mitigation plan.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-100 flex flex-col items-center justify-center border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-[#111]">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Compiling immediate action steps...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animation-fade-in">
              
              {/* Threat Level Banner */}
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider mb-1">Assessed Threat Level</p>
                  <p className="text-xl font-black text-rose-700 dark:text-rose-300">{result.threat_level}</p>
                </div>
                <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>

              {/* Immediate Actions */}
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  1. Immediate Action Steps
                </h3>
                <div className="space-y-4">
                  {result.immediate_actions.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                        {step.step_number}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{step.action}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-bold">Assign to: <span className="text-rose-500 dark:text-rose-400">{step.assigned_to}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication Template */}
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    2. Guest Communication
                  </h3>
                  <button 
                    onClick={copyTemplate}
                    className="text-xs font-semibold bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    {copied ? "Copied! ✓" : "Copy Template"}
                  </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-100 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium leading-relaxed">
                  {result.guest_communication_template}
                </div>
              </div>

              {/* Vendor Mitigation */}
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  3. Financial & Vendor Mitigation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {result.vendor_mitigation_strategy}
                </p>
              </div>

            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}