"use client";

import {
  ChartLineUpIcon,
  RocketLaunchIcon,
  ShieldIcon,
  SwordIcon,
  TargetIcon,
  TrendUpIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "market-intel")!;

interface MarketIntelData {
  company_name: string;
  industry: string;
  market_sentiment: string;
  key_competitors: string[];
  swot_analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  executive_summary: string;
}

function sentimentVariant(sentiment: string): "success" | "danger" | "neutral" {
  const s = sentiment.toLowerCase();
  if (s.includes("bullish") || s.includes("positive")) return "success";
  if (s.includes("bearish") || s.includes("negative")) return "danger";
  return "neutral";
}

export default function MarketIntelDashboard() {
  const [company, setCompany] = useState("");
  const [data, setData] = useState<MarketIntelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/finance/intel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.intel);
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
        backHref="/finance"
        backLabel="Back to Finance"
      />

      <form
        onSubmit={analyzeMarket}
        className="mb-10 flex gap-3 rounded-lg border border-border bg-background p-2"
      >
        <Input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Enter a company name (e.g. Tesla, Zomato, OpenAI)..."
          className="h-11 flex-1 border-0 bg-transparent focus:border-transparent"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !company.trim()} size="lg">
          {loading ? "Analyzing..." : "Generate report"}
        </Button>
      </form>

      {loading ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <AgentLoadingState label="Analyzing market position..." />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <AgentErrorState message={error} />
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-6 lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="mb-1 text-xl font-semibold text-ink">{data.company_name}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">{data.industry}</p>
                </div>
                <Badge variant={sentimentVariant(data.market_sentiment)}>{data.market_sentiment}</Badge>
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="mb-2 text-sm font-medium text-ink">Executive summary</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{data.executive_summary}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-ink">
                <SwordIcon /> Top competitors
              </h3>
              <ul className="space-y-2.5">
                {data.key_competitors.map((comp, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink"
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs text-ink-subtle">
                      {i + 1}
                    </span>
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="mb-4 mt-4 flex items-center gap-2 text-base font-medium text-ink">
              <TargetIcon /> Comprehensive SWOT analysis
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SwotCard icon={ShieldIcon} label="Strengths" items={data.swot_analysis.strengths} tone="success" />
              <SwotCard icon={TargetIcon} label="Weaknesses" items={data.swot_analysis.weaknesses} tone="danger" />
              <SwotCard icon={RocketLaunchIcon} label="Opportunities" items={data.swot_analysis.opportunities} tone="accent" />
              <SwotCard icon={TrendUpIcon} label="Threats" items={data.swot_analysis.threats} tone="warning" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-6">
          <AgentEmptyState
            icon={ChartLineUpIcon}
            title="Ready to analyze"
            description="Enter a company name to generate a market intelligence report."
          />
        </div>
      )}
    </div>
  );
}

function SwotCard({
  icon: SwotIcon,
  label,
  items,
  tone,
}: {
  icon: typeof ShieldIcon;
  label: string;
  items: string[];
  tone: "success" | "danger" | "accent" | "warning";
}) {
  const tones = {
    success: "border-success/20 bg-success-tint text-success",
    danger: "border-danger/20 bg-danger-tint text-danger",
    accent: "border-accent-tint-border bg-accent-tint text-accent-ink",
    warning: "border-warning/20 bg-warning-tint text-warning",
  };
  return (
    <div className={`rounded-lg border p-5 ${tones[tone]}`}>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <SwotIcon weight="fill" /> {label}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ink">
            &bull; {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
