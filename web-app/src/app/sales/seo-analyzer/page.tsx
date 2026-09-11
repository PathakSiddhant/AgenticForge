"use client";

import { KeyIcon, MagnifyingGlassIcon, WrenchIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "seo-analyzer")!;

interface SEOData {
  seo_score: number;
  keyword_analysis: string;
  missing_lsi_keywords: string[];
  actionable_tips: string[];
}

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-danger";
}

export default function SEOAnalyzerDashboard() {
  const [targetKeyword, setTargetKeyword] = useState("");
  const [articleText, setArticleText] = useState("");
  const [data, setData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetKeyword.trim() || !articleText.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/seo-analyzer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_keyword: targetKeyword, article_text: articleText }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.audit);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-5">
          <form onSubmit={analyzeSEO} className="space-y-5">
            <div>
              <Label>1. Target keyword</Label>
              <Input
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="e.g. Best AI Tools for Sales"
                disabled={loading}
              />
            </div>
            <div>
              <Label>2. Article content</Label>
              <Textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="Paste your blog post or article text here..."
                className="h-64"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !targetKeyword.trim() || !articleText.trim()} className="w-full">
              {loading ? "Auditing content..." : "Run SEO audit"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-7">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Running SEO audit..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6 rounded-md border border-border bg-background p-5">
                  <div className="flex shrink-0 flex-col items-center justify-center">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      SEO score
                    </span>
                    <div className={`text-4xl font-semibold ${scoreTone(data.seo_score)}`}>
                      {data.seo_score}
                      <span className="text-lg text-ink-subtle">/100</span>
                    </div>
                  </div>
                  <div className="hidden h-14 w-px bg-border sm:block" />
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-ink">Keyword analysis</h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{data.keyword_analysis}</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-sm font-medium text-ink">
                    <KeyIcon /> Missing LSI keywords
                  </h3>
                  <p className="mb-3 text-xs text-ink-subtle">
                    Add these semantic keywords naturally to improve search relevance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_lsi_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-accent-tint-border bg-accent-tint px-3 py-1.5 text-sm font-medium text-accent-ink"
                      >
                        + {kw}
                      </span>
                    ))}
                    {data.missing_lsi_keywords.length === 0 && (
                      <span className="text-sm italic text-success">No major LSI keywords missing.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-warning/20 bg-warning-tint p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-warning">
                    <WrenchIcon weight="fill" /> Actionable SEO tips
                  </h4>
                  <ul className="space-y-2">
                    {data.actionable_tips.map((tip, i) => (
                      <li key={i} className="text-sm leading-relaxed text-ink">
                        {i + 1}. {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={MagnifyingGlassIcon}
                title="Awaiting content"
                description="Enter a target keyword and article text to run an SEO audit."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
