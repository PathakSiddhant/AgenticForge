// Path: web-app/src/app/media/page.tsx

import Link from "next/link";

export default function MediaCategory() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">🎬</span> Media & Content Agency
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Supercharge your creator workflows. Build viral hooks, write raw human scripts, and repurpose long-form content instantly.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Agent 1: Viral Hook Architect (Active) */}
        <Link href="/media/viral-hook" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-fuchsia-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 flex items-center justify-center text-2xl border border-fuchsia-100 dark:border-fuchsia-500/20">
              🧲
            </div>
            <span className="text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">Viral Hook Architect</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Crafts the crucial first 3-5 seconds of your video to grab attention, strictly avoiding robotic AI buzzwords.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Psychology</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">JSON</span>
          </div>
        </Link>

        {/* Agent 2: Coming Soon */}
        <div className="group flex flex-col bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-5 opacity-70">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-300 dark:border-slate-700 grayscale">
              ✍️
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Coming Next</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-500 dark:text-slate-400">The Raw Scriptwriter</h3>
          <p className="text-slate-500 dark:text-slate-600 text-sm mb-4 flex-1">Generates full-length video scripts with a conversational, high-energy tone perfect for engaging edits.</p>
        </div>

      </div>
    </div>
  );
}