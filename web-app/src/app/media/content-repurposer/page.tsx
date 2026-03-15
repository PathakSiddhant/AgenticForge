"use client";
import { useState } from "react";
import Link from "next/link";

interface RepurposeData {
  twitter_thread: string[];
  linkedin_post: string;
  short_form_script: string;
}

export default function ContentRepurposerDashboard() {
  const [sourceContent, setSourceContent] = useState("");
  const [coreMessage, setCoreMessage] = useState("");
  
  const [data, setData] = useState<RepurposeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repurposeContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceContent.trim() || !coreMessage.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/media/content-repurposer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          source_content: sourceContent,
          core_message: coreMessage
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.repurposed_content);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python backend running?");
    }
    
    setLoading(false);
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    alert(`${platform} content copied to clipboard!`);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/media" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors">
          <span>←</span> Back to Media
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-3xl border border-purple-200 dark:border-purple-500/20">
            ♻️
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">The Content Repurposer</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Transform one piece of long-form content into native posts for Twitter, LinkedIn, and Shorts.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="xl:col-span-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={repurposeContent} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Core Message / Takeaway
              </label>
              <input
                type="text"
                value={coreMessage}
                onChange={(e) => setCoreMessage(e.target.value)}
                placeholder="e.g., Consistency is more important than intensity."
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Source Content (Transcript/Article)
              </label>
              <textarea
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste your YouTube transcript, blog post, or brain dump here..."
                className="w-full h-64 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 resize-none text-sm leading-relaxed custom-scrollbar"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !sourceContent.trim() || !coreMessage.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 mt-4 shadow-md hover:shadow-xl focus:outline-none"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating Content...</>
              ) : (
                "Repurpose Everywhere"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Multi-Platform Outputs */}
        <div className="xl:col-span-8">
          {data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* X / Twitter Thread */}
              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-[#1DA1F2]">🐦</span> Viral X/Twitter Thread
                  </h3>
                  <button onClick={() => copyToClipboard(data.twitter_thread.join('\n\n'), 'Twitter')} className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                    Copy All
                  </button>
                </div>
                <div className="space-y-4">
                  {data.twitter_thread.map((tweet, i) => (
                    <div key={i} className="bg-white dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm relative">
                      <span className="absolute top-4 right-4 text-xs font-bold text-slate-400">{i + 1}/{data.twitter_thread.length}</span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap pr-8">{tweet}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* LinkedIn Post */}
              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-[#0A66C2]">💼</span> LinkedIn Story
                  </h3>
                  <button onClick={() => copyToClipboard(data.linkedin_post, 'LinkedIn')} className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                    Copy
                  </button>
                </div>
                <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{data.linkedin_post}</p>
                </div>
              </div>

              {/* Shorts / Reels Script */}
              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-[#E1306C]">📱</span> Shorts/Reels Script (45s)
                  </h3>
                  <button onClick={() => copyToClipboard(data.short_form_script, 'Shorts')} className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                    Copy
                  </button>
                </div>
                <div className="bg-white dark:bg-[#111] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm border-l-4" style={{ borderLeftColor: '#f43f5e' }}>
                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed italic">{data.short_form_script}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-10 shadow-inner flex flex-col items-center justify-center text-center h-full min-h-125">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                🚀
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Content Multiplier</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mt-2">Paste a long-form script or transcript to instantly generate native content for X, LinkedIn, and Shorts.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}