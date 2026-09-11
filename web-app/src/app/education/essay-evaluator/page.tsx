"use client";

import { ChalkboardTeacherIcon, LightbulbIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "essay-evaluator")!;

interface EvaluationData {
  score: number;
  overall_verdict: string;
  grammar_and_spelling: string[];
  structural_feedback: string;
  improvement_tips: string[];
}

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-danger";
}

export default function EssayEvaluatorDashboard() {
  const [essayText, setEssayText] = useState("");
  const [criteria, setCriteria] = useState(
    "Grade out of 100. Focus strictly on grammar, flow, and logical arguments. College-level expectation."
  );
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/education/essay-evaluator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay_text: essayText, grading_criteria: criteria }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.evaluation);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={evaluateEssay} className="space-y-5">
            <div>
              <Label>1. Grading criteria / rubric</Label>
              <Textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                className="h-24"
                disabled={loading}
              />
            </div>
            <div>
              <Label>2. Student essay text</Label>
              <Textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Paste the student's essay here..."
                className="h-64"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !essayText.trim() || !criteria.trim()} className="w-full">
              {loading ? "Grading essay..." : "Evaluate & score essay"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <ResultPanel>
          {loading ? (
            <AgentLoadingState label="Grading essay..." />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Final score
                  </span>
                  <div className={`text-4xl font-semibold ${scoreTone(data.score)}`}>
                    {data.score}
                    <span className="text-lg text-ink-subtle">/100</span>
                  </div>
                </div>
                <div className="flex flex-2 flex-col justify-center rounded-md border border-border bg-background p-5">
                  <span className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Overall verdict
                  </span>
                  <p className="text-sm font-medium text-ink">{data.overall_verdict}</p>
                </div>
              </div>

              <div className="rounded-md border border-danger/20 bg-danger-tint p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-danger">
                  <WarningIcon weight="fill" /> Grammar &amp; spelling
                </h4>
                {data.grammar_and_spelling.length > 0 ? (
                  <ul className="space-y-1.5">
                    {data.grammar_and_spelling.map((err, i) => (
                      <li key={i} className="text-sm text-ink">
                        &bull; {err}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-success">No major grammatical errors found.</p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Structural feedback
                </h3>
                <p className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-ink">
                  {data.structural_feedback}
                </p>
              </div>

              <div className="rounded-md border border-accent-tint-border bg-accent-tint p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-accent-ink">
                  <LightbulbIcon weight="fill" /> Actionable tips
                </h4>
                <ul className="space-y-1.5">
                  {data.improvement_tips.map((tip, i) => (
                    <li key={i} className="text-sm text-ink">
                      {i + 1}. {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={ChalkboardTeacherIcon}
              title="Awaiting essay"
              description="Paste a student's essay to generate an automated scorecard."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
