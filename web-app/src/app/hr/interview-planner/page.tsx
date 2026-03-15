"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface Question {
  question: string;
  expected_answer: string;
}

interface InterviewPlanData {
  technical_questions: Question[];
  behavioral_questions: Question[];
  red_flags_to_probe: string[];
}

export default function InterviewPlannerDashboard() {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<InterviewPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Bhai, strict rule hai: Only PDF files allowed!");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || !file) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Sending PDF to AI Interrogator...");

    try {
      const formData = new FormData();
      formData.append("job_description", jd);
      formData.append("file", file);

      const aiRes = await fetch("https://agenticforge.onrender.com/api/hr/interview-planner", {
        method: "POST",
        body: formData,
      });
      
      const result = await aiRes.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.plan);
      }
    } catch (err: any) {
      setError("AI Engine se connect nahi ho paya. Is your Python server running?");
    }
    
    setLoading(false);
    setUploadStatus("");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/hr" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-6 transition-colors">
          <span>←</span> Back to HR
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-3xl border border-violet-200 dark:border-violet-500/20">
            🎤
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Interview Planner AI</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Generate a custom interrogation plan based on the candidate&apos;s exact resume claims.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel (Left Side - Smaller) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={generatePlan} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Job Description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the role requirements..."
                className="w-full h-40 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Candidate Resume (PDF)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'border-slate-300 dark:border-white/10 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10'}`}
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
                    <span className="text-violet-500 text-3xl block mb-2">✓</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-48">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <span className="text-3xl block mb-2">📄</span>
                    <p className="text-sm font-medium">Click to upload PDF</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !jd.trim() || !file}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {uploadStatus}</>
              ) : (
                "Generate Interview Plan"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Results Dashboard (Right Side - Wider) */}
        <div className="lg:col-span-8 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Red Flags Section */}
              <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 rounded-xl p-5">
                <h3 className="text-red-700 dark:text-red-400 font-bold text-lg mb-3 flex items-center gap-2">
                  <span>🚩</span> Red Flags to Probe Deeply
                </h3>
                {data.red_flags_to_probe.length > 0 ? (
                  <ul className="space-y-2">
                    {data.red_flags_to_probe.map((flag, i) => (
                      <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-0.5">!</span> {flag}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">No obvious red flags detected in the resume.</p>
                )}
              </div>

              {/* Technical Questions Section */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <span>💻</span> Targeted Technical Interrogation
                </h3>
                <div className="space-y-4">
                  {data.technical_questions.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm">
                      <p className="text-slate-800 dark:text-slate-200 font-bold mb-3 flex items-start gap-3">
                        <span className="text-violet-500 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded text-sm">Q{i+1}</span>
                        {q.question}
                      </p>
                      <div className="bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-lg border-l-4 border-violet-400">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Expected Answer / Cheat Sheet</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{q.expected_answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral Questions Section */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <span>🤝</span> Behavioral & Culture Fit
                </h3>
                <div className="space-y-4">
                  {data.behavioral_questions.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm">
                      <p className="text-slate-800 dark:text-slate-200 font-bold mb-3 flex items-start gap-3">
                        <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-sm">B{i+1}</span>
                        {q.question}
                      </p>
                      <div className="bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-lg border-l-4 border-emerald-400">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">What to look for</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{q.expected_answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                🕵️‍♂️
              </div>
              <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Awaiting Candidate Data</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mt-2">Provide the Job Description and candidate&apos;s PDF resume to generate a customized interrogation plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}