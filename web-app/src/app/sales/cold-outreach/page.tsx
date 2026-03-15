"use client";
import { useState } from "react";
import Link from "next/link";

interface OutreachData {
  subject_lines: string[];
  email_body: string;
  personalization_angle: string;
  spam_score_warning: string;
}

export default function ColdOutreachDashboard() {
  const [prospectInfo, setProspectInfo] = useState("");
  const [ourProduct, setOurProduct] = useState("");
  const [tone, setTone] = useState("Professional yet conversational");
  const [data, setData] = useState<OutreachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectInfo.trim() || !ourProduct.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/sales/cold-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prospect_info: prospectInfo,
          our_product: ourProduct,
          tone: tone
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.campaign);
      }
    } catch (err) {
      setError("AI Engine connection failed. Check if Python is running.");
    }
    
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getSpamScoreColor = (score: string) => {
    const s = score.toLowerCase();
    if (s.includes("low")) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
    if (s.includes("medium")) return "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
    return "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/sales" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 mb-6 transition-colors">
          <span>←</span> Back to Sales
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-3xl border border-orange-200 dark:border-orange-500/20">
            ✉️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cold Outreach Architect</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Generate non-spammy, highly personalized B2B emails that actually get replies.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={generateEmail} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Prospect Context (Target)
              </label>
              <textarea
                value={prospectInfo}
                onChange={(e) => setProspectInfo(e.target.value)}
                placeholder="e.g., John is the VP of Sales at TechCorp. They recently raised $10M Series A and are hiring aggressively."
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Our Product / Offer
              </label>
              <textarea
                value={ourProduct}
                onChange={(e) => setOurProduct(e.target.value)}
                placeholder="e.g., We sell an AI platform that automates lead generation and saves SDRs 15 hours a week."
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                3. Email Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500/50 text-sm appearance-none"
                disabled={loading}
              >
                <option value="Professional yet conversational">Professional yet conversational</option>
                <option value="Direct and straight to the point">Direct and straight to the point</option>
                <option value="Casual and friendly">Casual and friendly</option>
                <option value="Humorous and witty">Humorous and witty</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !prospectInfo.trim() || !ourProduct.trim()}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Writing Draft...</>
              ) : (
                "Generate Campaign"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Output Dashboard */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Info Row (Spam Score & Angle) */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-4 flex-1 ${getSpamScoreColor(data.spam_score_warning)}`}>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Spam Score</span>
                  <span className="font-extrabold">{data.spam_score_warning}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Personalization Angle</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">&quot;{data.personalization_angle}&quot;</p>
              </div>

              {/* Subject Lines */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🎯</span> Winning Subject Lines
                </h3>
                <div className="space-y-2">
                  {data.subject_lines.map((line, i) => (
                    <div key={i} className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-3 rounded-lg shadow-sm group">
                      <span className="text-sm text-slate-800 dark:text-slate-200">{line}</span>
                      <button onClick={() => copyToClipboard(line)} className="text-slate-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        📋
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>✍️</span> Email Body
                  </h3>
                  <button onClick={() => copyToClipboard(data.email_body)} className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
                    Copy Draft
                  </button>
                </div>
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-sm">
                  {data.email_body}
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-20 h-20 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-4xl grayscale opacity-50">
                🚀
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Ready to Sell</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Enter your prospect&apos;s info and your product details to generate high-converting cold email copy.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}