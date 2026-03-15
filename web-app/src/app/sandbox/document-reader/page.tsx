"use client";
import { useState } from "react";
import Link from "next/link";

export default function DocumentReader() {
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!documentText || !question) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("https://agenticforge.onrender.com/api/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          document_text: documentText,
          question: question
        }),
      });
      
      const data = await res.json();
      setResponse(data.reply || data.error); 
    } catch (error) {
      setResponse("Backend se connect nahi ho paya bhai. Python server on hai?");
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Link href="/sandbox" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 mb-8 transition-colors">
        <span>←</span> Back to Sandbox
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-2xl border border-amber-200 dark:border-amber-500/20">
            📚
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Document Q&A AI (RAG Base)</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Paste a specific text in the context box, then ask a question. The AI will strictly answer based ONLY on the provided text.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm gap-4">
          
          <div>
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">1. The Source Document</h2>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste a long paragraph or article here..."
              className="w-full h-48 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 resize-none transition-colors text-sm"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">2. Your Question</h2>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What is the main topic of the text?"
              className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={loading || !documentText || !question}
            className="mt-2 w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-amber-600"
          >
            {loading ? "Reading Document..." : "Find Answer"}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-inner transition-colors">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>✨</span> Extracted Answer
          </h2>
          <div className="flex-1 w-full min-h-50 bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-auto relative transition-colors">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-amber-600 dark:border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : response ? (
              <p className="text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {response}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-600 font-mono text-sm">Provide a document and a question to see the magic...</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}