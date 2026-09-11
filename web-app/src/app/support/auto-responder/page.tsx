"use client";

import { CopyIcon, PenNibIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { toast } from "sonner";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "auto-responder")!;

interface ResponderData {
  draft_reply: string;
  tone_used: string;
  policy_followed: string;
  needs_human_review: boolean;
}

export default function AutoResponderDashboard() {
  const [customerName, setCustomerName] = useState("");
  const [companyPolicy, setCompanyPolicy] = useState(
    "Standard refund policy is 30 days from purchase. No exceptions unless product is defective."
  );
  const [customerMessage, setCustomerMessage] = useState("");
  const [data, setData] = useState<ResponderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim() || !companyPolicy.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/auto-responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName || "Customer",
          company_policy: companyPolicy,
          customer_message: customerMessage,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.response_draft);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Draft copied to clipboard.");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/support"
        backLabel="Back to Support"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-5">
          <form onSubmit={generateReply} className="space-y-5">
            <div>
              <Label>Customer name (optional)</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Relevant company policy</Label>
              <Textarea
                value={companyPolicy}
                onChange={(e) => setCompanyPolicy(e.target.value)}
                className="h-24"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Customer message</Label>
              <Textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Paste the customer's question or complaint here..."
                className="h-40"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !customerMessage.trim() || !companyPolicy.trim()} className="w-full">
              {loading ? "Drafting reply..." : "Generate draft"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-7">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Drafting your reply..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-5">
                {data.needs_human_review && (
                  <div className="flex items-start gap-3 rounded-md border border-warning/20 bg-warning-tint p-4">
                    <WarningIcon className="mt-0.5 size-4 shrink-0 text-warning" weight="fill" />
                    <div>
                      <h4 className="text-sm font-medium text-warning">Human review required</h4>
                      <p className="mt-1 text-xs text-ink-muted">
                        This request contradicts policy or is highly sensitive - review before sending.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border border-border bg-background p-4">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                      Tone applied
                    </span>
                    <span className="text-sm font-medium text-accent-ink">{data.tone_used}</span>
                  </div>
                  <div className="rounded-md border border-border bg-background p-4">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                      Policy enforcement
                    </span>
                    <span className="text-sm font-medium text-ink">{data.policy_followed}</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                      <PenNibIcon className="size-3.5" /> Draft reply
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.draft_reply)}
                      className="flex items-center gap-1 text-xs font-medium text-accent-ink hover:underline"
                    >
                      <CopyIcon className="size-3.5" /> Copy
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-ink">
                    {data.draft_reply}
                  </div>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={PenNibIcon}
                title="Awaiting message"
                description="Paste a customer message to generate a policy-compliant reply."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
