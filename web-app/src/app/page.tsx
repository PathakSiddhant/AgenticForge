// Path: web-app/src/app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Agentic AI Engine v1.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          The Workspace for <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Autonomous Workflows.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          Deploy specialized AI agents across Finance, HR, Logistics, and Media. Automate complex tasks instantly without writing a single line of backend code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/10"
          >
            Enter Workspace →
          </Link>
          <a 
            href="https://github.com/PathakSiddhant/AgenticForge" 
            target="_blank"
            className="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-full font-bold text-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}