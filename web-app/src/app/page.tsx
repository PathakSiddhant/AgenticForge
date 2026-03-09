import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Storefront Hero Section */}
      <div className="mb-12 rounded-3xl bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-white/10 p-10 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[80px]"></div>
        <div className="relative z-10">
          <span className="px-3 py-1 text-xs font-bold bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/20 mb-4 inline-block">
            AgenticForge v1.0
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 dark:text-white tracking-tight">
            The AI Agent <br className="hidden md:block"/> Marketplace.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mb-6">
            A curated collection of highly specialized, autonomous AI agents ready to streamline your workflows across industries.
          </p>
        </div>
      </div>

      {/* NAYA SECTION: Developer Sandbox (Proof of Work) */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>🛠️</span> The Sandbox <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full border border-purple-200 dark:border-purple-500/20">Basics & Fundamentals</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {/* Basic Agent 1: JSON Structurer */}
        <Link href="/sandbox/json-structurer" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-orange-500/50 hover:shadow-xl dark:hover:bg-[#141414] cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-2xl border border-orange-100 dark:border-orange-500/20">
              🧱
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Foundation</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">Data Structurer AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Takes raw text input and strictly outputs formatted JSON data. The core of Agentic AI.</p>
        </Link>

        {/* Basic Agent 2: Simple Memory Bot */}
        <Link href="/sandbox/memory-bot" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-pink-500/50 hover:shadow-xl dark:hover:bg-[#141414] cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-2xl border border-pink-100 dark:border-pink-500/20">
              🧠
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Foundation</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400">Contextual Memory AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Learns to remember previous conversation history within an active session.</p>
        </Link>
      </div>

      {/* PURANA SECTION: Industry Agents Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Industry Agents</h2>
        <span className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">View all</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Finance Agent Card */}
        <Link href="/finance/market-intel" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-500/20">
              📈
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Finance</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Market Intel Agent</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Scrapes live market data to provide instant competitor pricing, trends, and SWOT analysis.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Tool Calling</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Web Search API</span>
          </div>
        </Link>

        {/* HR Agent Card */}
        <Link href="/hr/resume-screener" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-2xl border border-emerald-100 dark:border-emerald-500/20">
              📄
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Human Resources</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Resume Screener</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Matches candidate resumes against job descriptions and outputs a detailed JSON scoring matrix.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Structured JSON</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Doc Parsing</span>
          </div>
        </Link>

        {/* Education Agent Card */}
        <Link href="/education/edu-planner" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-2xl border border-purple-100 dark:border-purple-500/20">
              🧠
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Education</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Edu-Planner Agent</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Reads your course syllabus and automatically generates custom MCQs and study plans.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">RAG Pipeline</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Vector DB</span>
          </div>
        </Link>

      </div>
    </div>
  );
}