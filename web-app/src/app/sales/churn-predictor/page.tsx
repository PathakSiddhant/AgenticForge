"use client";

import { BrainIcon, ShieldIcon, TrendDownIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "churn-predictor")!;

interface ChurnData {
  churn_risk: string;
  sentiment_analysis: string;
  key_frustrations: string[];
  retention_strategy: string;
}

function riskVariant(risk: string): "danger" | "warning" | "success" {
  const r = risk.toLowerCase();
  if (r.includes("high")) return "danger";
  if (r.includes("medium")) return "warning";
  return "success";
}

export default function ChurnPredictorDashboard() {
  const [customerTenure, setCustomerTenure] = useState("");
  const [customerHistory, setCustomerHistory] = useState("");
  const [data, setData] = useState<ChurnData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeChurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerHistory.trim() || !customerTenure.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/churn-predictor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_tenure: customerTenure, customer_history: customerHistory }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.prediction);
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
        backHref="/sales"
        backLabel="Back to Sales"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={analyzeChurn} className="space-y-5">
            <div>
              <Label>1. Customer tenure</Label>
              <Input
                value={customerTenure}
                onChange={(e) => setCustomerTenure(e.target.value)}
                placeholder="e.g. 3 months, 2 years"
                disabled={loading}
              />
            </div>
            <div>
              <Label>2. Support ticket history / chat logs</Label>
              <Textarea
                value={customerHistory}
                onChange={(e) => setCustomerHistory(e.target.value)}
                placeholder="Paste recent emails or support chats from this customer..."
                className="h-64"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !customerHistory.trim() || !customerTenure.trim()} className="w-full">
              {loading ? "Analyzing risk..." : "Predict churn risk"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <ResultPanel>
          {loading ? (
            <AgentLoadingState label="Analyzing churn risk..." />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-6 text-center">
                <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Predicted churn risk
                </span>
                <Badge variant={riskVariant(data.churn_risk)}>
                  <span className="text-sm font-semibold uppercase">{data.churn_risk}</span>
                </Badge>
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                  <BrainIcon /> Customer sentiment
                </h3>
                <p className="text-sm italic leading-relaxed text-ink-muted">
                  &quot;{data.sentiment_analysis}&quot;
                </p>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                  <WarningIcon /> Key frustrations
                </h3>
                <ul className="space-y-2">
                  {data.key_frustrations.map((pain, i) => (
                    <li
                      key={i}
                      className="rounded-md border-l-2 border-l-danger border-y border-r border-border bg-background p-3 text-sm text-ink"
                    >
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-accent-tint-border bg-accent-tint p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-accent-ink">
                  <ShieldIcon weight="fill" /> Recommended retention strategy
                </h4>
                <p className="text-sm leading-relaxed text-ink">{data.retention_strategy}</p>
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={TrendDownIcon}
              title="Awaiting support data"
              description="Paste recent customer communications to predict churn risk."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
