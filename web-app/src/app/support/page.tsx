// Path: web-app/src/app/support/page.tsx

import Link from "next/link";

export default function SupportCategory() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">🎧</span> Customer Support
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Automate your helpdesk. Instantly route tickets, draft empathetic responses, and process refunds automatically.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Agent 1: Ticket Router (Active) */}
        <Link href="/support/ticket-router" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-teal-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-2xl border border-teal-100 dark:border-teal-500/20">
              🗂️
            </div>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Omni-Channel Ticket Router</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Reads incoming, messy customer emails and instantly assigns them a category, urgency, and correct department.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Triage Engine</span>
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
          <h3 className="text-lg font-bold mb-1 text-slate-500 dark:text-slate-400">Empathetic Auto-Responder</h3>
          <p className="text-slate-500 dark:text-slate-600 text-sm mb-4 flex-1">Drafts polite, highly accurate responses based on ticket history and company policy.</p>
        </div>

      </div>
    </div>
  );
}