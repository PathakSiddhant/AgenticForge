"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface StudyDay {
  day: string;
  topics_to_cover: string;
}

interface Flashcard {
  concept: string;
  definition: string;
}

interface MCQ {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface EduPlanData {
  study_plan: StudyDay[];
  flashcards: Flashcard[];
  mcq_quiz: MCQ[];
}

export default function EduPlannerDashboard() {
  const [timeframe, setTimeframe] = useState("7 Days");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<EduPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  
  // Quiz Interactive State (Kaunse question pe kya option click kiya)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Bhai, PDF file hi chalegi yahan.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleOptionClick = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({...prev, [qIndex]: option}));
  };

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedAnswers({});
    setUploadStatus("Reading Syllabus PDF...");

    try {
      const formData = new FormData();
      formData.append("timeframe", timeframe || "7 Days");
      formData.append("file", file);

      const aiRes = await fetch("http://localhost:8000/api/education/edu-planner", {
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
      setError("AI Engine connection failed. Is Python Uvicorn running?");
    }
    
    setLoading(false);
    setUploadStatus("");
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <Link href="/education" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 mb-6 transition-colors">
          <span>←</span> Back to Education
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-500/10 flex items-center justify-center text-3xl border border-fuchsia-200 dark:border-fuchsia-500/20">
            🧠
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edu-Planner AI</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Transform any boring PDF syllabus into a structured study plan and interactive quiz.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="xl:col-span-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm h-fit">
          <form onSubmit={generatePlan} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                1. Upload Notes/Syllabus (PDF)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/10' : 'border-slate-300 dark:border-white/10 hover:border-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10'}`}
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
                    <span className="text-fuchsia-500 text-3xl block mb-2">✓</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-48">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <span className="text-3xl block mb-2">📚</span>
                    <p className="text-sm font-medium">Drop Study Material PDF</p>
                    <p className="text-xs mt-1">(Max 15 pages for best results)</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                2. Your Timeframe
              </label>
              <input
                type="text"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="e.g., 7 Days, 2 Weeks, Tonight"
                className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-fuchsia-500/50 text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {uploadStatus}</>
              ) : (
                "Generate Curriculum"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: EdTech Dashboard */}
        <div className="xl:col-span-8 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-inner flex flex-col relative overflow-hidden min-h-125">
          {data ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 z-10 relative">
              
              {/* Section 1: Study Plan */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🗓️</span> Your Custom Study Plan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.study_plan.map((day, i) => (
                    <div key={i} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm border-t-4 hover:-translate-y-1 transition-transform" style={{ borderTopColor: '#d946ef' }}>
                      <span className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest block mb-2">{day.day}</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{day.topics_to_cover}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Flashcards */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>⚡</span> Quick Revision Flashcards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.flashcards.map((card, i) => (
                    <div key={i} className="bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-500/20 p-4 rounded-xl">
                      <h4 className="font-bold text-fuchsia-700 dark:text-fuchsia-400 text-sm mb-1">{card.concept}</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">&quot;{card.definition}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Interactive MCQ Quiz */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🎯</span> Knowledge Test (Interactive)
                </h2>
                <div className="space-y-6">
                  {data.mcq_quiz.map((mcq, qIndex) => {
                    const hasAnswered = selectedAnswers[qIndex] !== undefined;
                    const isCorrect = selectedAnswers[qIndex] === mcq.correct_answer;

                    return (
                      <div key={qIndex} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex gap-2">
                          <span className="text-fuchsia-500">Q{qIndex + 1}.</span> {mcq.question}
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                          {mcq.options.map((opt, oIndex) => {
                            let btnClass = "w-full text-left p-3 rounded-lg border text-sm transition-all ";
                            
                            if (!hasAnswered) {
                              btnClass += "border-slate-200 dark:border-white/10 hover:border-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10 text-slate-700 dark:text-slate-300";
                            } else {
                              if (opt === mcq.correct_answer) {
                                btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-300 font-bold";
                              } else if (opt === selectedAnswers[qIndex]) {
                                btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-500 dark:text-red-300";
                              } else {
                                btnClass += "border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed";
                              }
                            }

                            return (
                              <button 
                                key={oIndex} 
                                disabled={hasAnswered}
                                onClick={() => handleOptionClick(qIndex, opt)}
                                className={btnClass}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box (Reveals after clicking an option) */}
                        {hasAnswered && (
                          <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-500/20' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-500/20'}`}>
                            <p className="text-sm font-bold flex items-center gap-2 mb-1">
                              {isCorrect ? <><span className="text-emerald-500">✅</span> Correct!</> : <><span className="text-red-500">❌</span> Incorrect!</>}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-bold opacity-70 uppercase text-xs mr-2">Explanation:</span> 
                              {mcq.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-0">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl grayscale opacity-50">
                📝
              </div>
              <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Awaiting Syllabus</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mt-2">Upload your study material and set a timeframe to generate your personalized learning curriculum.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}