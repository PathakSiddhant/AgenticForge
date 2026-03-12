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


        {/* Agent 2: The Raw Scriptwriter (Active) */}
        <Link href="/media/raw-scriptwriter" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-pink-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-2xl border border-pink-100 dark:border-pink-500/20">
              ✍️
            </div>
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">The Raw Scriptwriter</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Generates full-length video scripts with a conversational, high-energy tone perfect for engaging edits. Zero AI buzzwords.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Storytelling</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Pacing</span>
          </div>
        </Link>

        {/* Agent 3: Content Repurposer (Active) */}
        <Link href="/media/content-repurposer" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-2xl border border-purple-100 dark:border-purple-500/20">
              ♻️
            </div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">The Content Repurposer</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Turn one long-form video or article into a viral Twitter thread, a LinkedIn post, and a high-energy Shorts script instantly.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Omni-Channel</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Format AI</span>
          </div>
        </Link>


      </div>
    </div>
  );
}