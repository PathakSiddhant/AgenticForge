// Path: web-app/src/app/hr/page.tsx

import Link from "next/link";

export default function HrCategory() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Category Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">👥</span> Human Resources (HR)
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Automate talent acquisition, streamline resume screening, and empower your HR department with AI-driven applicant tracking systems.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Agent 1: Resume Screener (Active) */}
        <Link href="/hr/resume-screener" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-rose-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-2xl border border-rose-100 dark:border-rose-500/20">
              📄
            </div>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">AI Resume Screener</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Ruthlessly evaluates candidate resumes against job descriptions to provide match scores and missing skills.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">ATS Analytics</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">JSON Output</span>
          </div>
        </Link>

        {/* Agent 2: Interview Planner AI (Active) */}
        <Link href="/hr/interview-planner" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-violet-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-2xl border border-violet-100 dark:border-violet-500/20">
              🎤
            </div>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Interview Planner AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Generates customized technical and behavioral interview questions to verify candidate claims.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Custom Interrogation</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">PDF Input</span>
          </div>
        </Link>

        {/* Agent 3: Onboarding Assistant (Active) */}
        <Link href="/hr/onboarding-rag" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-teal-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-2xl border border-teal-100 dark:border-teal-500/20">
              👋
            </div>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Onboarding RAG Bot</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Answers new employee queries by instantly reading company policies and HR manual PDFs.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Policy Extraction</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Q&A Chat</span>
          </div>
        </Link>

      </div>
    </div>
  );
}