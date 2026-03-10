"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface ScreeningData {
  match_score: number;
  verdict: string;
  key_strengths: string[];
  missing_requirements: string[];
  hr_notes: string;
}

export default function ResumeScreenerDashboard() {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ScreeningData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  // Naya analyzeResume function jo direct Python API se baat karega
  const analyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || !file) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Sending PDF to AI Engine...");

    try {
      // 1. Direct Multipart Form Data banaya
      const formData = new FormData();
      formData.append("job_description", jd);
      formData.append("file", file);

      // 2. Seedha Python API ko bhej diya (No JSON headers!)
      const aiRes = await fetch("http://localhost:8000/api/hr/resume-screener", {
        method: "POST",
        body: formData, // Browser khud isko file aur text mein set kar lega
      });
      
      const result = await aiRes.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.analysis);
      }
    } catch (err: any) {
      setError("AI Engine se connect nahi ho paya. Is Python Uvicorn running?");
    }
    
    setLoading(false);
    setUploadStatus("");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getVerdictBadge = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes("strong") || v.includes("hire")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
    if (v.includes("potential") || v.includes("borderline")) return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
    return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/hr" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 mb-6 transition-colors">
          <span>←</span> Back to HR
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-3xl border border-rose-200 dark:border-rose-500/20">
            📄
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Resume Screener</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Upload a PDF resume and instantly evaluate it against your Job Description.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={analyzeResume} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Job Description (JD)
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job requirements here..."
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Upload Candidate Resume (PDF)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-white/10 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10'}`}
              >
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="text-center">
                    <span className="text-emerald-500 text-3xl block mb-2">✓</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <span className="text-3xl block mb-2">📂</span>
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="text-xs mt-1">Strictly PDF files only</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !jd.trim() || !file}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {uploadStatus}</>
              ) : (
                "Upload & Generate Scorecard"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: The Scorecard */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Match Score</span>
                  <div className={`text-5xl font-extrabold ${getScoreColor(data.match_score)}`}>
                    {data.match_score}<span className="text-xl text-slate-400">%</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Final Verdict</span>
                  <span className={`px-4 py-2 font-bold rounded-lg border ${getVerdictBadge(data.verdict)}`}>
                    {data.verdict}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">HR Notes / Summary</h3>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.hr_notes}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4">
                  <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2">
                    <span>✅</span> Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {data.key_strengths.map((str, i) => (
                      <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-4">
                  <h4 className="text-rose-700 dark:text-rose-400 font-bold text-sm mb-3 flex items-center gap-2">
                    <span>❌</span> Missing Requirements
                  </h4>
                  {data.missing_requirements.length > 0 ? (
                    <ul className="space-y-2">
                      {data.missing_requirements.map((req, i) => (
                        <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-rose-500 mt-0.5">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No major requirements missing!</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-20 h-20 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-4xl grayscale opacity-50">
                ⚖️
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Resume</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Upload a candidate&apos;s PDF resume to automatically parse and analyze it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}