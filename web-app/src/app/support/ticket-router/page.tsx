"use client";

import { BuildingsIcon, TargetIcon, TrayIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "ticket-router")!;

interface RoutingData {
  category: string;
  urgency_level: string;
  assigned_department: string;
  one_line_summary: string;
  escalation_required: boolean;
}

function urgencyVariant(urgency: string): "danger" | "warning" | "success" {
  const u = urgency.toLowerCase();
  if (u.includes("critical") || u.includes("high")) return "danger";
  if (u.includes("medium")) return "warning";
  return "success";
}

export default function TicketRouterDashboard() {
  const [customerMessage, setCustomerMessage] = useState("");
  const [data, setData] = useState<RoutingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/ticket-router`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_message: customerMessage }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.routing);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={routeTicket} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                Raw customer message
              </label>
              <Textarea
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Paste the angry, confusing, or lengthy email from the customer here..."
                className="h-64"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !customerMessage.trim()} className="w-full">
              {loading ? "Routing ticket..." : "Analyze & route ticket"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <ResultPanel>
          {loading ? (
            <AgentLoadingState label="Triaging ticket..." />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-5">
              <div className="rounded-md border border-border bg-background p-5">
                {data.escalation_required && (
                  <Badge variant="danger" dot className="mb-3">
                    <WarningIcon weight="fill" /> Escalation required
                  </Badge>
                )}
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Issue summary</h3>
                <p className="text-base font-medium text-ink">&quot;{data.one_line_summary}&quot;</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border bg-background p-4">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Category
                  </span>
                  <span className="text-sm font-medium text-ink">{data.category}</span>
                </div>
                <div className="rounded-md border border-border bg-background p-4">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Urgency
                  </span>
                  <Badge variant={urgencyVariant(data.urgency_level)}>{data.urgency_level}</Badge>
                </div>
              </div>

              <div className="rounded-md border border-accent-tint-border bg-accent-tint p-5">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-accent-ink">
                  <TargetIcon weight="fill" /> Route to department
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-background text-accent-ink">
                    <BuildingsIcon className="size-4" />
                  </div>
                  <span className="text-base font-medium text-ink">{data.assigned_department}</span>
                </div>
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={TrayIcon}
              title="Awaiting ticket"
              description="Paste a customer message to triage and route it to the right team."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
