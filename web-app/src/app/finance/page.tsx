import Link from "next/link";

export default function FinanceCategory() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">📈</span> Finance & Trading
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Enterprise-grade financial AI agents designed for market research, competitor analysis, portfolio management, and automated trading intelligence.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Agent 1: Market Intel (Active) */}
        <Link href="/finance/market-intel" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-500/20">
              📊
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Market Intel Agent</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Deep dives into any company to provide instant sentiment, competitor tracking, and a full SWOT analysis.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Structured JSON</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">GenAI 2.5</span>
          </div>
        </Link>

        {/* Agent 2: Portfolio Risk Analyzer (Active) */}
        <Link href="/finance/portfolio-risk" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-2xl border border-purple-100 dark:border-purple-500/20">
              ⚖️
            </div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Portfolio Risk AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Analyzes user holdings against market outlook to calculate strict risk scores and provide actionable rebalancing advice.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Risk Modeling</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">JSON Output</span>
          </div>
        </Link>

        {/* Agent 3: Earnings Report RAG (Active) */}
        <Link href="/finance/earnings-rag" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-indigo-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-2xl border border-indigo-100 dark:border-indigo-500/20">
              🧾
            </div>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Earnings Report RAG</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Ingests financial excerpts to strictly answer queries while extracting key figures and confidence metrics.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">RAG Analytics</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Data Extraction</span>
          </div>
        </Link>

      </div>
    </div>
  );
}