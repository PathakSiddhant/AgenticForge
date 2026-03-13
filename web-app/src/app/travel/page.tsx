// Path: web-app/src/app/travel/page.tsx

import Link from "next/link";

export default function TravelCategoryPage() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">✈️</span> Travel & Event Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Deploy intelligent agents to plan hyper-personalized itineraries, negotiate with vendors, and manage real-time crisis events.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Agent 1: Itinerary Planner (Active) */}
        <Link href="/travel/itinerary-planner" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-sky-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-2xl border border-sky-100 dark:border-sky-500/20">
              🗺️
            </div>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Hyper-Personalized Itinerary</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Generate a realistic, day-by-day travel schedule with estimated costs based on exact vibes and budget.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Predictive AI</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">JSON</span>
          </div>
        </Link>

        {/* Agent 2: Vendor Negotiator (Active) */}
        <Link href="/travel/vendor-negotiator" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-indigo-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-2xl border border-indigo-100 dark:border-indigo-500/20">
              🤝
            </div>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Vendor Negotiator</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Drafts psychological negotiation emails to help lower quotes from event caterers and venues without losing respect.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Psychology</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Copywriting</span>
          </div>
        </Link>

        {/* Agent 3: Crisis Manager (Active) */}
        <Link href="/travel/crisis-manager" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-rose-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-2xl border border-rose-100 dark:border-rose-500/20">
              🚨
            </div>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Crisis Manager</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Generates instant action plans and client communication templates during sudden event disruptions to prevent panic.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Triage AI</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Action Plans</span>
          </div>
        </Link>


      </div>
    </div>
  );
}