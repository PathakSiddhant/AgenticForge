"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface OnboardingData {
  answer: string;
  policy_reference: string;
  confidence: string;
}

export default function OnboardingRagDashboard() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Bhai, PDF file hi upload karni hai!");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const askAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !file) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Reading Company Policy PDF...");

    try {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("file", file);

      const aiRes = await fetch("http://localhost:8000/api/hr/onboarding-rag", {
        method: "POST",
        body: formData,
      });
      
      const result = await aiRes.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.response);
      }
    } catch (err: any) {
      setError("AI Engine se connect nahi ho paya. Is your Python server running?");
    }
    
    setLoading(false);
    setUploadStatus("");
  };

  const getConfidenceColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes("high")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    if (l.includes("medium")) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/hr" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors">
          <span>←</span> Back to HR
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center text-3xl border border-teal-200 dark:border-teal-500/20">
            👋
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Onboarding RAG Bot</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Instant policy answers extracted directly from your company&apos;s official handbook.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={askAssistant} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Upload Company Manual (PDF)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10' : 'border-slate-300 dark:border-white/10 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10'}`}
              >
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="text-center px-4">
                    <span className="text-teal-500 text-3xl block mb-2">✓</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-48">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <span className="text-3xl block mb-2">📘</span>
                    <p className="text-sm font-medium">Click to upload Policy PDF</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Employee Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., How many sick leaves do I get in a year?"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim() || !file}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {uploadStatus}</>
              ) : (
                "Ask HR Assistant"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Answer */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative h-full flex flex-col">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🤖</span> AI Response
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Confidence:</span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getConfidenceColor(data.confidence)}`}>
                    {data.confidence}
                  </span>
                </div>
              </div>

              {/* The Answer Box */}
              <div className="flex-1">
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-5 rounded-xl mb-4 relative">
                  <div className="absolute -left-2 -top-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">HR</div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm mt-2">
                    {data.answer}
                  </p>
                </div>

                {/* Policy Reference Box */}
                <div className="bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-500/20 rounded-xl p-4">
                  <h4 className="text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>📑</span> Official Policy Reference
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic border-l-2 border-teal-300 dark:border-teal-700 pl-3">
                    &quot;{data.policy_reference}&quot;
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-20 h-20 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-4xl grayscale opacity-50">
                💬
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Ready to Help</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Upload the company manual and ask your query to get instant, policy-backed answers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}