"use client";

import { RobotIcon, TargetIcon, TrendUpIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "earnings-rag")!;

interface EarningsData {
  direct_answer: string;
  extracted_metrics: string[];
  confidence_level: string;
}

function confidenceVariant(level: string): "success" | "warning" | "danger" {
  const l = level.toLowerCase();
  if (l.includes("high")) return "success";
  if (l.includes("medium")) return "warning";
  return "danger";
}

export default function EarningsRagDashboard() {
  const [documentText, setDocumentText] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim() || !query.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/finance/earnings-rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_text: documentText, query }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.analysis);
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
        backHref="/finance"
        backLabel="Back to Finance"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={analyzeDocument} className="space-y-5">
            <div>
              <Label>1. Financial document excerpt</Label>
              <Textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="Paste an earnings report paragraph here (e.g. 'In Q3, total revenue was $5.2 billion, up 12% year-over-year...')"
                className="h-48"
                disabled={loading}
              />
            </div>
            <div>
              <Label>2. Your audit query</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. What was the total revenue and how much did it grow?"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !documentText.trim() || !query.trim()} className="w-full">
              {loading ? "Extracting insights..." : "Run AI audit"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <ResultPanel>
          {loading ? (
            <AgentLoadingState label="Auditing document..." />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                  <TargetIcon /> Audit results
                </h2>
                <Badge variant={confidenceVariant(data.confidence_level)}>
                  {data.confidence_level} confidence
                </Badge>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Direct answer
                </h3>
                <p className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-ink">
                  {data.direct_answer}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Key metrics extracted
                </h3>
                {data.extracted_metrics && data.extracted_metrics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.extracted_metrics.map((metric, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 rounded-md border border-accent-tint-border bg-accent-tint px-3 py-1.5 text-sm font-medium text-accent-ink"
                      >
                        <TrendUpIcon className="size-3.5" /> {metric}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-border bg-background p-4 text-sm italic text-ink-muted">
                    No specific numbers or metrics found to answer this query.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={RobotIcon}
              title="Awaiting document"
              description="Provide a financial excerpt and a query to extract facts and figures."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
