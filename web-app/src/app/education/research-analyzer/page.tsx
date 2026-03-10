"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface ResearchData {
  paper_title: string;
  core_methodology: string;
  key_findings: string[];
  limitations: string[];
  tldr_summary: string;
}

export default function ResearchAnalyzerDashboard() {
  const [focusArea, setFocusArea] = useState("General Overview");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a valid PDF research paper.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const analyzePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Ingesting Research PDF...");

    try {
      const formData = new FormData();
      formData.append("focus_area", focusArea || "General Overview");
      formData.append("file", file);

      const aiRes = await fetch("http://localhost:8000/api/education/research-analyzer", {
        method: "POST",
        body: formData,
      });
      
      const result = await aiRes.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.analysis);
      }
    } catch (err: any) {
      setError("AI Engine connection failed. Is Python running?");
    }
    
    setLoading(false);
    setUploadStatus("");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/education" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <span>←</span> Back to Education
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-3xl border border-blue-200 dark:border-blue-500/20">
            📄
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Research Paper Analyzer</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Upload complex academic PDFs and instantly extract key findings, methodologies, and summaries.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={analyzePaper} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Upload Paper (PDF)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-300 dark:border-white/10 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}
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
                    <span className="text-blue-500 text-3xl block mb-2">✓</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-48">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <span className="text-3xl block mb-2">📁</span>
                    <p className="text-sm font-medium">Click to upload Paper</p>
                    <p className="text-xs mt-1">(First 10 pages will be scanned)</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Optional: Focus Area
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g., Just focus on the datasets used"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {uploadStatus}</>
              ) : (
                "Analyze Paper"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Results Dashboard */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Title & TLDR */}
              <div className="border-b border-slate-200 dark:border-white/10 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                  {data.paper_title}
                </h2>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-5">
                  <h3 className="text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>⚡</span> TL;DR Summary
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {data.tldr_summary}
                  </p>
                </div>
              </div>

              {/* Core Methodology */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <span>🔬</span> Core Methodology
                </h3>
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.core_methodology}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Findings */}
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <span>💡</span> Key Findings
                  </h3>
                  <ul className="space-y-3">
                    {data.key_findings.map((finding, i) => (
                      <li key={i} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 shadow-sm flex items-start gap-3">
                        <span className="text-blue-500 font-bold mt-0.5">{i+1}.</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-3 flex items-center gap-2">
                    <span>⚠️</span> Limitations & Flaws
                  </h3>
                  <ul className="space-y-3">
                    {data.limitations.map((lim, i) => (
                      <li key={i} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 shadow-sm flex items-start gap-3">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                🧬
              </div>
              <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Awaiting Research Paper</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mt-2">Upload an academic PDF to extract methodologies, findings, and summaries instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}