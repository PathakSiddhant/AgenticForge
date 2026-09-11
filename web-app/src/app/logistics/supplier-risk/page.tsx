"use client";

import { CheckCircleIcon, ShieldIcon, ShieldWarningIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "supplier-risk")!;

interface RiskData {
  overall_risk_score: number;
  risk_level: string;
  identified_red_flags: string[];
  strategic_recommendation: string;
}

function scoreTone(score: number) {
  if (score >= 70) return "text-danger";
  if (score >= 40) return "text-warning";
  return "text-success";
}

function riskVariant(level: string): "danger" | "warning" | "success" {
  const l = level.toLowerCase();
  if (l.includes("critical") || l.includes("high")) return "danger";
  if (l.includes("medium")) return "warning";
  return "success";
}

export default function SupplierRiskDashboard() {
  const [supplierName, setSupplierName] = useState("");
  const [contractTerms, setContractTerms] = useState("");
  const [pastHistory, setPastHistory] = useState("");
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !contractTerms.trim() || !pastHistory.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logistics/supplier-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_name: supplierName,
          contract_terms: contractTerms,
          past_performance_history: pastHistory,
        }),
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
    <div className="mx-auto max-w-6xl pb-12">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/logistics"
        backLabel="Back to Logistics"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-5">
          <form onSubmit={runAudit} className="space-y-5">
            <div>
              <Label>Supplier / vendor name</Label>
              <Input
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Global Packaging Solutions Inc."
                disabled={loading}
              />
            </div>
            <div>
              <Label>Key contract / SLA terms</Label>
              <Textarea
                value={contractTerms}
                onChange={(e) => setContractTerms(e.target.value)}
                placeholder="Paste key clauses here, e.g. 'Vendor guarantees delivery within 14 days...'"
                className="h-32"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Past performance history</Label>
              <Textarea
                value={pastHistory}
                onChange={(e) => setPastHistory(e.target.value)}
                placeholder="e.g. Last 3 orders were delayed by 4, 2, and 6 days."
                className="h-32"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !supplierName.trim() || !contractTerms.trim() || !pastHistory.trim()}
              className="w-full"
            >
              {loading ? "Auditing vendor..." : "Run risk audit"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-7">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Auditing vendor..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6 rounded-md border border-border bg-background p-6">
                  <div className="flex shrink-0 flex-col items-center justify-center">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Risk score
                    </span>
                    <div className={`text-4xl font-semibold ${scoreTone(data.overall_risk_score)}`}>
                      {data.overall_risk_score}
                      <span className="text-lg text-ink-subtle">/100</span>
                    </div>
                  </div>
                  <div className="hidden h-14 w-px bg-border sm:block" />
                  <div className="flex-1">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Threat level
                    </h3>
                    <Badge variant={riskVariant(data.risk_level)}>{data.risk_level} risk</Badge>
                    <p className="mt-2 text-xs text-ink-subtle">
                      Score above 70 requires immediate procurement intervention.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                    <ShieldWarningIcon /> Critical red flags
                  </h3>
                  {data.identified_red_flags.length > 0 ? (
                    <ul className="space-y-2">
                      {data.identified_red_flags.map((flag, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 rounded-md border-l-2 border-l-danger border-y border-r border-border bg-background p-3 text-sm font-medium text-ink"
                        >
                          <WarningIcon className="mt-0.5 size-4 shrink-0 text-danger" weight="fill" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="flex items-center gap-2 rounded-md border border-success/20 bg-success-tint p-4 text-sm font-medium text-success">
                      <CheckCircleIcon weight="fill" /> No major red flags detected.
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-accent-tint-border bg-accent-tint p-5">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-accent-ink">
                    <ShieldIcon weight="fill" /> Strategic recommendation
                  </h4>
                  <p className="text-sm font-medium leading-relaxed text-ink">{data.strategic_recommendation}</p>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={ShieldWarningIcon}
                title="Awaiting supplier data"
                description="Paste contract clauses and delivery history to audit vendor reliability."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
