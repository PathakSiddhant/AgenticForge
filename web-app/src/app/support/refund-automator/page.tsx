"use client";

import { BrainIcon, EnvelopeIcon, ScalesIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "refund-automator")!;

interface RefundData {
  decision: string;
  reasoning: string;
  customer_response: string;
  refund_amount: number;
}

function decisionVariant(decision: string): "success" | "danger" | "warning" {
  const d = decision.toLowerCase();
  if (d.includes("approved")) return "success";
  if (d.includes("rejected")) return "danger";
  return "warning";
}

export default function RefundAutomatorDashboard() {
  const [customerReason, setCustomerReason] = useState("");
  const [daysSincePurchase, setDaysSincePurchase] = useState<number | "">("");
  const [purchaseAmount, setPurchaseAmount] = useState<number | "">("");
  const [companyPolicy, setCompanyPolicy] = useState(
    "Full refund allowed within 30 days of purchase. No refunds after 30 days under any circumstances. Physical damage by customer is not covered."
  );
  const [data, setData] = useState<RefundData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processRMA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerReason.trim() || daysSincePurchase === "" || purchaseAmount === "") return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/refund-automator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_reason: customerReason,
          days_since_purchase: Number(daysSincePurchase),
          purchase_amount: Number(purchaseAmount),
          company_policy: companyPolicy,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.rma_decision);
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
        backHref="/support"
        backLabel="Back to Support"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-5">
          <form onSubmit={processRMA} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase amount ($)</Label>
                <Input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 299"
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Days since purchase</Label>
                <Input
                  type="number"
                  value={daysSincePurchase}
                  onChange={(e) => setDaysSincePurchase(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 14"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <Label>Strict company policy</Label>
              <Textarea
                value={companyPolicy}
                onChange={(e) => setCompanyPolicy(e.target.value)}
                className="h-24"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Customer reason for refund</Label>
              <Textarea
                value={customerReason}
                onChange={(e) => setCustomerReason(e.target.value)}
                placeholder="e.g. I just didn't like the color when it arrived."
                className="h-32"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !customerReason.trim() || daysSincePurchase === "" || purchaseAmount === ""}
              className="w-full"
            >
              {loading ? "Processing RMA..." : "Process refund request"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-7">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Processing RMA decision..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                    <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Final decision
                    </span>
                    <Badge variant={decisionVariant(data.decision)}>
                      <span className="text-sm font-semibold uppercase">{data.decision}</span>
                    </Badge>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Refund amount
                    </span>
                    <div className="text-2xl font-semibold text-ink">${data.refund_amount.toFixed(2)}</div>
                  </div>
                </div>

                <div className="rounded-md border-l-2 border-l-accent border-y border-r border-border bg-background p-5">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                    <BrainIcon weight="fill" /> AI reasoning
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-ink">{data.reasoning}</p>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                    <EnvelopeIcon /> Customer response draft
                  </h3>
                  <div className="whitespace-pre-wrap rounded-md border border-border bg-background p-5 text-sm leading-relaxed text-ink">
                    {data.customer_response}
                  </div>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={ScalesIcon}
                title="Awaiting request"
                description="Enter purchase details and the customer's reason to automate the RMA decision."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
