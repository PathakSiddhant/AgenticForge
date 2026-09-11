"use client";

import { ChartPieSliceIcon, LightbulbIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "portfolio-risk")!;

interface RiskData {
  overall_risk_score: number;
  risk_category: string;
  diversity_health: string;
  vulnerabilities: string[];
  rebalancing_recommendations: string[];
}

function riskTone(score: number) {
  if (score < 40) return { text: "text-success", bar: "bg-success" };
  if (score < 70) return { text: "text-warning", bar: "bg-warning" };
  return { text: "text-danger", bar: "bg-danger" };
}

export default function PortfolioRiskDashboard() {
  const [holdings, setHoldings] = useState("");
  const [marketOutlook, setMarketOutlook] = useState("Neutral Market");
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdings.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/finance/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings, market_outlook: marketOutlook }),
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-1">
          <form onSubmit={analyzeRisk} className="space-y-5">
            <div>
              <Label>Current holdings (assets &amp; %)</Label>
              <Textarea
                value={holdings}
                onChange={(e) => setHoldings(e.target.value)}
                placeholder="e.g. 40% Nifty50, 30% Bitcoin, 20% Gold, 10% Cash"
                className="h-32"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Market outlook</Label>
              <Select value={marketOutlook} onChange={(e) => setMarketOutlook(e.target.value)} disabled={loading}>
                <option value="Bullish (Expecting Growth)">Bullish (expecting growth)</option>
                <option value="Neutral Market">Neutral market</option>
                <option value="Bearish (Expecting Recession/Crash)">Bearish (expecting recession/crash)</option>
                <option value="Highly Volatile/Uncertain">Highly volatile / uncertain</option>
              </Select>
            </div>
            <Button type="submit" disabled={loading || !holdings.trim()} className="w-full">
              {loading ? "Calculating..." : "Run risk analysis"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Running risk analysis..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-6 text-center">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Overall risk score
                    </p>
                    <div className={`text-5xl font-semibold ${riskTone(data.overall_risk_score).text}`}>
                      {data.overall_risk_score}
                      <span className="text-lg text-ink-subtle">/100</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className={`h-full rounded-full ${riskTone(data.overall_risk_score).bar}`}
                        style={{ width: `${data.overall_risk_score}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center rounded-md border border-border bg-background p-6">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Risk classification
                    </p>
                    <h3 className="mb-4 text-lg font-semibold text-ink">{data.risk_category}</h3>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Diversity health
                    </p>
                    <p className="text-sm leading-relaxed text-ink-muted">{data.diversity_health}</p>
                  </div>
                </div>

                <div className="rounded-md border border-danger/20 bg-danger-tint p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-danger">
                    <WarningIcon weight="fill" /> Critical vulnerabilities
                  </h4>
                  <ul className="space-y-2">
                    {data.vulnerabilities.map((item, i) => (
                      <li key={i} className="rounded-md bg-background/60 p-3 text-sm text-ink">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-accent-tint-border bg-accent-tint p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-accent-ink">
                    <LightbulbIcon weight="fill" /> Rebalancing recommendations
                  </h4>
                  <ul className="space-y-2">
                    {data.rebalancing_recommendations.map((item, i) => (
                      <li key={i} className="rounded-md bg-background/60 p-3 text-sm text-ink">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={ChartPieSliceIcon}
                title="Waiting for portfolio data"
                description="Enter your asset allocation and market outlook to generate a risk analysis."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
