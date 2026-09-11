"use client";

import { CheckCircleIcon, FlagIcon, HandshakeIcon, UserSoundIcon } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "interview-planner")!;

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
  const [uploadStatus, setUploadStatus] = useState("");

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

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || !file) return;
    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Reading resume...");

    try {
      const formData = new FormData();
      formData.append("job_description", jd);
      formData.append("file", file);

      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/interview-planner`, {
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
        backHref="/hr"
        backLabel="Back to HR"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-4">
          <form onSubmit={generatePlan} className="space-y-5">
            <div>
              <Label>1. Job description</Label>
              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the role requirements..."
                className="h-40"
                disabled={loading}
              />
            </div>
            <div>
              <Label>2. Candidate resume (PDF)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors ${file ? "border-success bg-success-tint" : "border-border hover:border-accent hover:bg-accent-tint"}`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="px-4 text-center">
                    <CheckCircleIcon className="mx-auto mb-2 size-6 text-success" weight="fill" />
                    <p className="w-48 truncate text-sm font-medium text-ink">{file.name}</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-ink-subtle">Click to upload PDF</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={loading || !jd.trim() || !file} className="w-full">
              {loading ? uploadStatus || "Generating..." : "Generate interview plan"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="lg:col-span-8">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label={uploadStatus || "Building interview plan..."} />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-8">
                <div className="rounded-md border border-danger/20 bg-danger-tint p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-danger">
                    <FlagIcon weight="fill" /> Red flags to probe
                  </h3>
                  {data.red_flags_to_probe.length > 0 ? (
                    <ul className="space-y-2">
                      {data.red_flags_to_probe.map((flag, i) => (
                        <li key={i} className="text-sm text-ink">
                          &bull; {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-ink-muted">No obvious red flags detected.</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-base font-medium text-ink">
                    <UserSoundIcon /> Technical questions
                  </h3>
                  <div className="space-y-3">
                    {data.technical_questions.map((q, i) => (
                      <QuestionCard key={i} index={i + 1} q={q} accent />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-base font-medium text-ink">
                    <HandshakeIcon /> Behavioral &amp; culture fit
                  </h3>
                  <div className="space-y-3">
                    {data.behavioral_questions.map((q, i) => (
                      <QuestionCard key={i} index={i + 1} q={q} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={UserSoundIcon}
                title="Awaiting candidate data"
                description="Provide the job description and resume to generate an interview plan."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  index,
  q,
  accent,
}: {
  index: number;
  q: Question;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="mb-2.5 flex items-start gap-2.5 text-sm font-medium text-ink">
        <span
          className={`shrink-0 rounded-sm px-1.5 py-0.5 text-xs ${accent ? "bg-accent-tint text-accent-ink" : "bg-success-tint text-success"}`}
        >
          {index}
        </span>
        {q.question}
      </p>
      <div className="rounded-md bg-surface p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
          What to look for
        </p>
        <p className="text-sm text-ink-muted">{q.expected_answer}</p>
      </div>
    </div>
  );
}
