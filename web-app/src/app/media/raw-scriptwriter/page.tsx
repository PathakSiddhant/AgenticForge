"use client";
import { useState } from "react";
import Link from "next/link";

interface ScriptData {
  video_title_ideas: string[];
  full_script: string;
  pacing_notes: string;
}

export default function RawScriptwriterDashboard() {
  const [coreTopic, setCoreTopic] = useState("");
  const [approvedHook, setApprovedHook] = useState("");
  const [targetLength, setTargetLength] = useState<number | "">("");
  const [creatorVibe, setCreatorVibe] = useState("High energy and hype");
  
  const [data, setData] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreTopic.trim() || !approvedHook.trim() || targetLength === "") return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/media/raw-scriptwriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          core_topic: coreTopic,
          approved_hook: approvedHook,
          target_length_minutes: Number(targetLength),
          creator_vibe: creatorVibe
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.script_content);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Script copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/media" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 mb-6 transition-colors">
          <span>←</span> Back to Media
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-3xl border border-pink-200 dark:border-pink-500/20">
            ✍️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">The Raw Scriptwriter</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Turn your hook into a full, high-retention video script that sounds 100% human.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={generateScript} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Core Topic / Idea
              </label>
              <textarea
                value={coreTopic}
                onChange={(e) => setCoreTopic(e.target.value)}
                placeholder="e.g., Tactical breakdown of Messi's False 9 role."
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Approved Hook (First 5 seconds)
              </label>
              <textarea
                value={approvedHook}
                onChange={(e) => setApprovedHook(e.target.value)}
                placeholder="Paste the hook from the Viral Hook Architect here..."
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Target Length (Mins)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={targetLength}
                  onChange={(e) => setTargetLength(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g., 1.5"
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/50 text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Creator Vibe
                </label>
                <select
                  value={creatorVibe}
                  onChange={(e) => setCreatorVibe(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-pink-500/50 text-sm appearance-none"
                  disabled={loading}
                >
                  <option value="Aggressive sports fan">Aggressive & Hype</option>
                  <option value="Analytical and calm">Analytical & Calm</option>
                  <option value="Storytelling and mysterious">Storytelling</option>
                  <option value="Casual and funny">Casual & Funny</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !coreTopic.trim() || !approvedHook.trim() || targetLength === ""}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-4 shadow-lg shadow-pink-500/20"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Writing Script...</>
              ) : (
                "Draft Full Script"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Script Output */}
        <div className="lg:col-span-8 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-150">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Title Ideas & Pacing Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>🔥</span> Clickable Title Ideas
                  </h3>
                  <ul className="space-y-2">
                    {data.video_title_ideas.map((title, i) => (
                      <li key={i} className="text-sm text-slate-800 dark:text-slate-200 font-bold border-l-2 border-pink-500 pl-3 py-1">
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-500/20 p-5 rounded-xl shadow-sm">
                  <h3 className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>⏱️</span> Delivery & Pacing Notes
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {data.pacing_notes}
                  </p>
                </div>
              </div>

              {/* The Script Document */}
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-100 dark:bg-white/5 px-5 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Master Script Document</span>
                  </div>
                  <button onClick={() => copyToClipboard(data.full_script)} className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-800 transition-colors flex items-center gap-1">
                    <span>📋</span> Copy Script
                  </button>
                </div>
                <div className="p-6 md:p-8 text-base text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans max-h-125 overflow-y-auto custom-scrollbar">
                  {data.full_script}
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                📝
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Writer&apos;s Room Empty</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Paste your topic and winning hook to generate a highly engaging, human-sounding script.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}