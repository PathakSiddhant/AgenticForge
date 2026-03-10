// Path: web-app/src/app/education/page.tsx

import Link from "next/link";

export default function EducationCategory() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">🎓</span> Education & Research
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Empower learning and academic research with AI. Analyze heavy papers, generate study plans, and automate curriculum building.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Agent 1: Research Paper Analyzer (Active) */}
        <Link href="/education/research-analyzer" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-500/20">
              📄
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Research Paper Analyzer</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Upload complex academic PDFs and extract methodologies, key findings, and TLDR summaries instantly.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Academic RAG</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">PDF Data</span>
          </div>
        </Link>

        {/* Agent 2: Edu-Planner Agent (Coming Next!) */}
        <div className="group flex flex-col bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-5 opacity-70">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-300 dark:border-slate-700 grayscale">
              🧠
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Coming Next</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-500 dark:text-slate-400">Edu-Planner Agent</h3>
          <p className="text-slate-500 dark:text-slate-600 text-sm mb-4 flex-1">Reads your course syllabus and automatically generates custom MCQs and structured study plans.</p>
        </div>

      </div>
    </div>
  );
}