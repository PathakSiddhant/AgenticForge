"use client";
import { useState } from "react";
import Link from "next/link";

interface HookOption {
  hook_type: string;
  audio_script: string;
  visual_action: string;
}

interface HookData {
  top_hooks: HookOption[];
  target_emotion: string;
  retention_tip: string;
}

export default function ViralHookDashboard() {
  const [coreTopic, setCoreTopic] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("YouTube Shorts / Reels");
  const [creatorVibe, setCreatorVibe] = useState("High energy and hype");
  
  const [data, setData] = useState<HookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreTopic.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/media/viral-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          core_topic: coreTopic,
          target_platform: targetPlatform,
          creator_vibe: creatorVibe
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.hook_strategy);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/media" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 mb-6 transition-colors">
          <span>←</span> Back to Media
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-500/10 flex items-center justify-center text-3xl border border-fuchsia-200 dark:border-fuchsia-500/20">
            🧲
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Viral Hook Architect</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Design the critical first 3 seconds of your video to lock in viewers.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={generateHook} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Core Topic / Idea
              </label>
              <textarea
                value={coreTopic}
                onChange={(e) => setCoreTopic(e.target.value)}
                placeholder="e.g., Why Messi's 2012 season will never be repeated."
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-fuchsia-500/50 resize-none text-sm leading-relaxed"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Target Platform
              </label>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 text-sm appearance-none"
                disabled={loading}
              >
                <option value="YouTube Shorts / Reels">Shorts / Reels (Under 60s)</option>
                <option value="YouTube Long Form">YouTube Long Form (8m+)</option>
                <option value="Twitter / X Video">Twitter / X Native Video</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Creator Vibe / Tone
              </label>
              <select
                value={creatorVibe}
                onChange={(e) => setCreatorVibe(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 text-sm appearance-none"
                disabled={loading}
              >
                <option value="High energy and hype">High Energy & Hype</option>
                <option value="Analytical and calm">Analytical & Calm</option>
                <option value="Aggressive and opinionated">Aggressive & Opinionated</option>
                <option value="Storytelling and mysterious">Storytelling & Mysterious</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !coreTopic.trim()}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-4 shadow-lg shadow-fuchsia-500/20"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Brainstorming...</>
              ) : (
                "Generate Hooks"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Hook Strategy */}
        <div className="lg:col-span-8 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Strategy Meta Info */}
              <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <div className="flex-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: '#d946ef' }}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Emotion</span>
                  <span className="font-bold text-base text-fuchsia-600 dark:text-fuchsia-400">{data.target_emotion}</span>
                </div>
                <div className="flex-2 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-fuchsia-800 dark:text-fuchsia-400 uppercase tracking-widest block mb-1 items-center gap-1"><span>💡</span> Retention Tip</span>
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{data.retention_tip}</span>
                </div>
              </div>

              {/* Hook Options */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>🔥</span> Top 3 Hook Variations
                </h3>
                
                {data.top_hooks.map((hook, index) => (
                  <div key={index} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row group transition-all hover:border-fuchsia-500/30">
                    
                    {/* Visual Action Side */}
                    <div className="bg-slate-100 dark:bg-white/5 p-5 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-white/5">
                      <span className="inline-block px-2 py-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 shadow-sm">
                        {hook.hook_type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visual Action</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                        {hook.visual_action}
                      </p>
                    </div>
                    
                    {/* Audio Script Side */}
                    <div className="p-5 sm:w-2/3 relative">
                      <div className="absolute top-4 right-4 text-4xl opacity-5 dark:opacity-10 font-serif">&quot;</div>
                      <h4 className="text-xs font-bold text-fuchsia-500 uppercase tracking-wider mb-2">Audio Script (0-3s)</h4>
                      <p className="text-base md:text-lg text-slate-900 dark:text-white font-bold leading-relaxed">
                        &quot;{hook.audio_script}&quot;
                      </p>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                🎬
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Ready to go Viral?</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Enter your video topic to generate punchy, high-retention hooks without the AI buzzwords.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}