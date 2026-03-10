"use client";
import { useState } from "react";
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
  const [resume, setResume] = useState("");
  const [data, setData] = useState<ScreeningData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || !resume.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/hr/resume-screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          job_description: jd,
          resume_text: resume
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.analysis);
      }
    } catch (err) {
      setError("Backend se connect nahi ho paya. Is your Python server running?");
    }
    
    setLoading(false);
  };

  // Score & Verdict styling logic
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
      {/* Header Section */}
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
            <p className="text-slate-600 dark:text-slate-400 mt-1">Instant candidate evaluation and ATS scorecard generation.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Forms */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={analyzeResume} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Job Description (JD)
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the requirements (e.g., Need a React & Next.js developer with 3 years of experience...)"
                className="w-full h-32 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Candidate Resume
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste the candidate's resume text here..."
                className="w-full h-48 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !jd.trim() || !resume.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Screening Candidate...</>
              ) : (
                "Generate ATS Scorecard"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: The Scorecard Dashboard */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden">
          
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Top Row: Score & Verdict */}
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

              {/* HR Notes */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">HR Notes / Summary</h3>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.hr_notes}
                </div>
              </div>

              {/* Strengths & Missing Grid */}
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
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Data</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Paste the Job Description and the Candidate&apos;s Resume to generate a comprehensive ATS scorecard.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}