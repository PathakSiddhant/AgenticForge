"use client";

import { CopyIcon, HandshakeIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { toast } from "sonner";

import { AgentEmptyState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "vendor-negotiator")!;

interface NegotiationScript {
  strategy_name: string;
  psychology_used: string;
  subject_line: string;
  email_body: string;
}
interface NegotiationPlan {
  savings_potential: number;
  negotiation_scripts: NegotiationScript[];
}

export default function VendorNegotiator() {
  const [formData, setFormData] = useState({
    vendor_type: "",
    initial_quote: "",
    target_budget: "",
    leverage: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NegotiationPlan | null>(null);
  const [error, setError] = useState("");

  const generateScripts = async () => {
    if (!formData.vendor_type || !formData.initial_quote || !formData.target_budget) {
      setError("Please fill out all mandatory fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/travel/vendor-negotiator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_type: formData.vendor_type,
          initial_quote: parseInt(formData.initial_quote),
          target_budget: parseInt(formData.target_budget),
          leverage: formData.leverage || "We are comparing multiple vendors right now.",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.negotiation_plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Email copied to clipboard.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/travel"
        backLabel="Back to Travel"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-fit space-y-5 rounded-lg border border-border bg-background p-6 lg:col-span-1">
          <div>
            <Label>Vendor type</Label>
            <Input
              value={formData.vendor_type}
              onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
              placeholder="e.g. Wedding Caterer, DJ, Venue"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quote ($)</Label>
              <Input
                type="number"
                value={formData.initial_quote}
                onChange={(e) => setFormData({ ...formData, initial_quote: e.target.value })}
                placeholder="e.g. 5000"
              />
            </div>
            <div>
              <Label>Target ($)</Label>
              <Input
                type="number"
                value={formData.target_budget}
                onChange={(e) => setFormData({ ...formData, target_budget: e.target.value })}
                placeholder="e.g. 4000"
              />
            </div>
          </div>
          <div>
            <Label>Your leverage</Label>
            <Textarea
              value={formData.leverage}
              onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
              placeholder="e.g. We have 3 more corporate events this year, or 'A competitor quoted $3800'."
              rows={3}
            />
          </div>
          <Button onClick={generateScripts} disabled={loading} className="w-full">
            {loading ? "Drafting strategies..." : "Generate email scripts"}
          </Button>
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
        </div>

        <div className="lg:col-span-2">
          {!result ? (
            <ResultPanel>
              {loading ? (
                <AgentLoadingState label="Analyzing psychology & generating scripts..." />
              ) : (
                <AgentEmptyState
                  icon={HandshakeIcon}
                  title="Ready to negotiate"
                  description="Enter vendor details to draft negotiation scripts."
                />
              )}
            </ResultPanel>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-md border border-accent-tint-border bg-accent-tint p-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                    Potential savings
                  </p>
                  <p className="text-2xl font-semibold text-ink">${result.savings_potential}</p>
                </div>
                <p className="text-sm font-medium text-ink-muted">
                  {result.negotiation_scripts.length} strategic approaches generated
                </p>
              </div>

              <div className="space-y-4">
                {result.negotiation_scripts.map((script, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg border border-border bg-background">
                    <div className="border-b border-border bg-surface px-6 py-4">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="flex items-center gap-2 text-base font-medium text-ink">
                          <span className="text-accent-ink">#{idx + 1}</span> {script.strategy_name}
                        </h3>
                        <button
                          onClick={() => copyToClipboard(script.email_body)}
                          className="flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface"
                        >
                          <CopyIcon className="size-3.5" /> Copy email
                        </button>
                      </div>
                      <p className="text-xs text-ink-muted">
                        <span className="font-semibold text-accent-ink">Psychology:</span> {script.psychology_used}
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Subject</span>
                        <p className="mt-1 text-sm font-medium text-ink">{script.subject_line}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Body</span>
                        <div className="mt-2 whitespace-pre-wrap rounded-md border border-border bg-surface p-4 font-mono text-sm leading-relaxed text-ink">
                          {script.email_body}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
