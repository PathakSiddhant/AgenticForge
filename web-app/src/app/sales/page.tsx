// Path: web-app/src/app/sales/page.tsx

import Link from "next/link";

export default function SalesCategory() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">💸</span> Sales & Marketing
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Supercharge your revenue engine. Generate hyper-personalized cold outreach, analyze SEO, and predict customer churn using AI.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Agent 1: Cold Outreach Architect (Active) */}
        <Link href="/sales/cold-outreach" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-orange-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-2xl border border-orange-100 dark:border-orange-500/20">
              ✉️
            </div>
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Cold Outreach Architect</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Generate highly personalized, non-spammy B2B cold emails based on prospect context and your product offering.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Copywriting AI</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">JSON JSON</span>
          </div>
        </Link>

        {/* Agent 2: Coming Soon */}
        <div className="group flex flex-col bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-5 opacity-70">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-300 dark:border-slate-700 grayscale">
              🔍
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Coming Next</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-500 dark:text-slate-400">SEO Content Analyzer</h3>
          <p className="text-slate-500 dark:text-slate-600 text-sm mb-4 flex-1">Grades blog posts and suggests missing keywords to help rank higher on Google.</p>
        </div>

        {/* Agent 3: Coming Soon */}
        <div className="group flex flex-col bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-5 opacity-70">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-300 dark:border-slate-700 grayscale">
              📉
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Coming Soon</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-500 dark:text-slate-400">Customer Churn Predictor</h3>
          <p className="text-slate-500 dark:text-slate-600 text-sm mb-4 flex-1">Analyzes support tickets to predict if a customer is at high risk of leaving your service.</p>
        </div>

      </div>
    </div>
  );
}