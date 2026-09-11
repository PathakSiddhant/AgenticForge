"use client";

import {
  CalendarBlankIcon,
  CardsThreeIcon,
  CheckCircleIcon,
  LightningIcon,
  TargetIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";

const agent = ALL_AGENTS.find((a) => a.slug === "edu-planner")!;

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
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});

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

  const handleOptionClick = (qIndex: number, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedAnswers({});
    setUploadStatus("Reading syllabus PDF...");

    try {
      const formData = new FormData();
      formData.append("timeframe", timeframe || "7 Days");
      formData.append("file", file);

      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/education/edu-planner`, {
        method: "POST",
        body: formData,
      });
      const result = await aiRes.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.plan);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
    setUploadStatus("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/education"
        backLabel="Back to Education"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 xl:col-span-4">
          <form onSubmit={generatePlan} className="space-y-5">
            <div>
              <Label>1. Upload notes/syllabus (PDF)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors ${file ? "border-success bg-success-tint" : "border-border hover:border-accent hover:bg-accent-tint"}`}
              >
                <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                {file ? (
                  <div className="px-4 text-center">
                    <CheckCircleIcon className="mx-auto mb-2 size-6 text-success" weight="fill" />
                    <p className="w-48 truncate text-sm font-medium text-ink">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center text-ink-subtle">
                    <p className="text-sm font-medium">Drop study material PDF</p>
                    <p className="mt-1 text-xs">Max 15 pages for best results</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>2. Your timeframe</Label>
              <Input
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="e.g. 7 Days, 2 Weeks, Tonight"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !file} className="w-full">
              {loading ? uploadStatus || "Generating..." : "Generate curriculum"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="xl:col-span-8">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label={uploadStatus || "Building your curriculum..."} />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-10">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
                    <CalendarBlankIcon /> Your study plan
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.study_plan.map((day, i) => (
                      <div key={i} className="rounded-md border-t-2 border-t-accent border-x border-b border-border bg-background p-4">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-accent-ink">
                          {day.day}
                        </span>
                        <p className="text-sm text-ink-muted">{day.topics_to_cover}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
                    <LightningIcon /> Quick revision flashcards
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.flashcards.map((card, i) => (
                      <div key={i} className="rounded-md border border-accent-tint-border bg-accent-tint p-4">
                        <h4 className="mb-1 text-sm font-medium text-accent-ink">{card.concept}</h4>
                        <p className="text-sm italic text-ink-muted">&quot;{card.definition}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
                    <TargetIcon /> Knowledge test
                  </h2>
                  <div className="space-y-5">
                    {data.mcq_quiz.map((mcq, qIndex) => {
                      const hasAnswered = selectedAnswers[qIndex] !== undefined;
                      const isCorrect = selectedAnswers[qIndex] === mcq.correct_answer;

                      return (
                        <div key={qIndex} className="rounded-md border border-border bg-background p-5">
                          <h4 className="mb-4 flex gap-2 text-sm font-medium text-ink">
                            <span className="text-accent-ink">Q{qIndex + 1}.</span> {mcq.question}
                          </h4>
                          <div className="mb-4 space-y-2">
                            {mcq.options.map((opt, oIndex) => {
                              const isRight = opt === mcq.correct_answer;
                              const isPicked = opt === selectedAnswers[qIndex];
                              return (
                                <button
                                  key={oIndex}
                                  disabled={hasAnswered}
                                  onClick={() => handleOptionClick(qIndex, opt)}
                                  className={cn(
                                    "w-full rounded-md border p-3 text-left text-sm transition-colors",
                                    !hasAnswered &&
                                      "border-border text-ink hover:border-accent hover:bg-accent-tint",
                                    hasAnswered &&
                                      isRight &&
                                      "border-success bg-success-tint font-medium text-success",
                                    hasAnswered &&
                                      !isRight &&
                                      isPicked &&
                                      "border-danger bg-danger-tint text-danger",
                                    hasAnswered &&
                                      !isRight &&
                                      !isPicked &&
                                      "cursor-not-allowed border-border text-ink-subtle opacity-50"
                                  )}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {hasAnswered && (
                            <div
                              className={cn(
                                "rounded-md border p-4",
                                isCorrect ? "border-success/20 bg-success-tint" : "border-danger/20 bg-danger-tint"
                              )}
                            >
                              <p className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                                {isCorrect ? (
                                  <>
                                    <CheckCircleIcon className="text-success" weight="fill" /> Correct
                                  </>
                                ) : (
                                  <>
                                    <XCircleIcon className="text-danger" weight="fill" /> Incorrect
                                  </>
                                )}
                              </p>
                              <p className="text-sm text-ink">
                                <span className="mr-1.5 text-xs font-semibold uppercase text-ink-subtle">
                                  Explanation:
                                </span>
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
              <AgentEmptyState
                icon={CardsThreeIcon}
                title="Awaiting syllabus"
                description="Upload your study material and set a timeframe to generate a curriculum."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
