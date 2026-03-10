import Link from "next/link";

export default function SandboxCategory() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white flex items-center gap-3">
          <span className="text-5xl">🛠️</span> Developer Sandbox
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Master the fundamentals of Agentic AI. These tools demonstrate core concepts like structured outputs, memory management, and tool-calling before integrating them into complex industry agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Basic Agent 1: JSON Structurer */}
        <Link href="/sandbox/json-structurer" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-orange-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-2xl border border-orange-100 dark:border-orange-500/20">
              🧱
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Foundation</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Data Structurer AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Takes raw text input and strictly outputs formatted JSON data. The core of Agentic AI.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Prompt Eng.</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">JSON Output</span>
          </div>
        </Link>

        {/* Basic Agent 2: Contextual Memory Bot (ACTIVE NOW) */}
        <Link href="/sandbox/memory-bot" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-pink-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-2xl border border-pink-100 dark:border-pink-500/20">
              🧠
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Foundation</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Contextual Memory AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Learns to remember previous conversation history within an active session using array context.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Session Array</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">History API</span>
          </div>
        </Link>

        {/* Basic Agent 3: Tool Calling AI */}
        <Link href="/sandbox/tool-caller" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-cyan-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-2xl border border-cyan-100 dark:border-cyan-500/20">
              🛠️
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Action</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Action Executor AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">Give AI the ability to take actions. It will decide when to trigger external Python functions (APIs) based on your prompt.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Function Calling</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">SDK Tools</span>
          </div>
        </Link>

        {/* Basic Agent 4: The Document Reader (RAG Base) */}
        <Link href="/sandbox/document-reader" className="group flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-xl dark:hover:bg-[#141414] transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-2xl border border-amber-100 dark:border-amber-500/20">
              📚
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-1 rounded-md">Foundation</span>
          </div>
          <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Document Q&A AI</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 flex-1">The foundation of RAG. Feed it a chunk of text and ask questions. It is strictly programmed to not hallucinate.</p>
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Context Window</span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">Strict Prompt</span>
          </div>
        </Link>

      </div>
    </div>
  );
}