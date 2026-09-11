"use client";

import { CopyIcon, PenNibIcon, PaperPlaneTiltIcon, TargetIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { toast } from "sonner";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "cold-outreach")!;

interface OutreachData {
  subject_lines: string[];
  email_body: string;
  personalization_angle: string;
  spam_score_warning: string;
}

function spamTone(score: string) {
  const s = score.toLowerCase();
  if (s.includes("low")) return "border-success/20 bg-success-tint text-success";
  if (s.includes("medium")) return "border-warning/20 bg-warning-tint text-warning";
  return "border-danger/20 bg-danger-tint text-danger";
}

export default function ColdOutreachDashboard() {
  const [prospectInfo, setProspectInfo] = useState("");
  const [ourProduct, setOurProduct] = useState("");
  const [tone, setTone] = useState("Professional yet conversational");
  const [data, setData] = useState<OutreachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectInfo.trim() || !ourProduct.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/cold-outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect_info: prospectInfo, our_product: ourProduct, tone }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.campaign);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/sales"
        backLabel="Back to Sales"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={generateEmail} className="space-y-5">
            <div>
              <Label>1. Prospect context (target)</Label>
              <Textarea
                value={prospectInfo}
                onChange={(e) => setProspectInfo(e.target.value)}
                placeholder="e.g. John is VP of Sales at TechCorp. They recently raised $10M Series A and are hiring aggressively."
                className="h-32"
                disabled={loading}
              />
            </div>
            <div>
              <Label>2. Our product / offer</Label>
              <Textarea
                value={ourProduct}
                onChange={(e) => setOurProduct(e.target.value)}
                placeholder="e.g. We sell an AI platform that automates lead generation and saves SDRs 15 hours a week."
                className="h-24"
                disabled={loading}
              />
            </div>
            <div>
              <Label>3. Email tone</Label>
              <Select value={tone} onChange={(e) => setTone(e.target.value)} disabled={loading}>
                <option value="Professional yet conversational">Professional yet conversational</option>
                <option value="Direct and straight to the point">Direct and straight to the point</option>
                <option value="Casual and friendly">Casual and friendly</option>
                <option value="Humorous and witty">Humorous and witty</option>
              </Select>
            </div>
            <Button type="submit" disabled={loading || !prospectInfo.trim() || !ourProduct.trim()} className="w-full">
              {loading ? "Writing draft..." : "Generate campaign"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <ResultPanel>
          {loading ? (
            <AgentLoadingState label="Writing your campaign..." />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-5">
              <div className={`flex items-center justify-between rounded-md border p-3.5 ${spamTone(data.spam_score_warning)}`}>
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Spam score</span>
                <span className="text-sm font-semibold">{data.spam_score_warning}</span>
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Personalization angle
                </span>
                <p className="text-sm italic text-ink-muted">&quot;{data.personalization_angle}&quot;</p>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                  <TargetIcon /> Winning subject lines
                </h3>
                <div className="space-y-2">
                  {data.subject_lines.map((line, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between rounded-md border border-border bg-background p-3"
                    >
                      <span className="text-sm text-ink">{line}</span>
                      <button
                        onClick={() => copyToClipboard(line)}
                        className="text-ink-subtle opacity-0 transition-opacity hover:text-accent-ink group-hover:opacity-100"
                        aria-label="Copy subject line"
                      >
                        <CopyIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
                    <PenNibIcon /> Email body
                  </h3>
                  <button
                    onClick={() => copyToClipboard(data.email_body)}
                    className="text-xs font-medium text-accent-ink hover:underline"
                  >
                    Copy draft
                  </button>
                </div>
                <div className="whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-ink">
                  {data.email_body}
                </div>
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={PaperPlaneTiltIcon}
              title="Ready to sell"
              description="Enter prospect info and product details to generate cold email copy."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
