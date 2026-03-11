"use client";
import { useState } from "react";
import Link from "next/link";

interface EvaluationData {
  score: number;
  overall_verdict: string;
  grammar_and_spelling: string[];
  structural_feedback: string;
  improvement_tips: string[];
}

export default function EssayEvaluatorDashboard() {
  const [essayText, setEssayText] = useState("");
  const [criteria, setCriteria] = useState("Grade out of 100. Focus strictly on grammar, flow, and logical arguments. College-level expectation.");
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateEssay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayText.trim() || !criteria.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/education/essay-evaluator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          essay_text: essayText,
          grading_criteria: criteria
        }),
      });
      
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.evaluation);
      }
    } catch (err) {
      setError("AI Engine connection failed. Is your Python server running?");
    }
    
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/education" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 mb-6 transition-colors">
          <span>←</span> Back to Education
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-3xl border border-amber-200 dark:border-amber-500/20">
            📝
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Essay Evaluator</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Ruthlessly grade student essays based on your custom criteria.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={evaluateEssay} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Grading Criteria / Rubric
              </label>
              <textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                className="w-full h-24 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Student Essay Text
              </label>
              <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Paste the student's essay here..."
                className="w-full h-64 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50 resize-none text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !essayText.trim() || !criteria.trim()}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Grading Essay...</>
              ) : (
                "Evaluate & Score Essay"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Scorecard Dashboard */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden">
          {data ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Score & Verdict Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Score</span>
                  <div className={`text-5xl font-extrabold ${getScoreColor(data.score)}`}>
                    {data.score}<span className="text-xl text-slate-400">/100</span>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl flex-2 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Verdict</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {data.overall_verdict}
                  </p>
                </div>
              </div>

              {/* Grammar & Spelling */}
              <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4">
                <h4 className="text-red-700 dark:text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                  <span>🚨</span> Grammar & Spelling Errors
                </h4>
                {data.grammar_and_spelling.length > 0 ? (
                  <ul className="space-y-2">
                    {data.grammar_and_spelling.map((err, i) => (
                      <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span> {err}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 italic font-medium">No major grammatical errors found! Excellent work.</p>
                )}
              </div>

              {/* Structural Feedback */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Structural Feedback</h3>
                <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {data.structural_feedback}
                </div>
              </div>

              {/* Improvement Tips */}
              <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4">
                <h4 className="text-amber-700 dark:text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                  <span>💡</span> Actionable Tips to Improve
                </h4>
                <ul className="space-y-2">
                  {data.improvement_tips.map((tip, i) => (
                    <li key={i} className="text-slate-700 dark:text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">{i+1}.</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-20 h-20 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-4xl grayscale opacity-50">
                👨‍🏫
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Awaiting Essay</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">Paste a student&apos;s essay to generate an automated, objective scorecard.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}