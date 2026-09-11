"use client";

import { CopyIcon, ShieldWarningIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { toast } from "sonner";

import { AgentEmptyState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "crisis-manager")!;

interface ActionStep {
  step_number: number;
  action: string;
  assigned_to: string;
}
interface CrisisPlan {
  threat_level: string;
  immediate_actions: ActionStep[];
  guest_communication_template: string;
  vendor_mitigation_strategy: string;
}

function threatVariant(level: string): "danger" | "warning" {
  return level.toLowerCase().includes("critical") ? "danger" : "warning";
}

export default function CrisisManager() {
  const [formData, setFormData] = useState({
    event_type: "",
    crisis_description: "",
    current_status: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrisisPlan | null>(null);
  const [error, setError] = useState("");

  const generateCrisisPlan = async () => {
    if (!formData.event_type || !formData.crisis_description || !formData.current_status) {
      setError("Please fill out all fields so we can accurately assess the threat level.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/travel/crisis-manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.crisis_plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate crisis plan.");
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.guest_communication_template);
    toast.success("Template copied to clipboard.");
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
        <div className="h-fit space-y-5 rounded-lg border border-danger/20 bg-background p-6 lg:col-span-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-danger" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink">Emergency intake</h2>
          </div>
          <div>
            <Label>Event type</Label>
            <Input
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              placeholder="e.g. Outdoor Wedding, Corporate Summit"
            />
          </div>
          <div>
            <Label>What went wrong?</Label>
            <Textarea
              value={formData.crisis_description}
              onChange={(e) => setFormData({ ...formData, crisis_description: e.target.value })}
              placeholder="e.g. Heavy rain started unexpectedly, the main tent is leaking."
              rows={3}
            />
          </div>
          <div>
            <Label>Current status</Label>
            <Textarea
              value={formData.current_status}
              onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
              placeholder="e.g. Guests arrive in 10 minutes, caterers are stuck in traffic, no backup power."
              rows={3}
            />
          </div>
          <Button onClick={generateCrisisPlan} disabled={loading} variant="danger" className="w-full">
            {loading ? "Analyzing threat level..." : "Generate action plan"}
          </Button>
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
        </div>

        <div className="lg:col-span-2">
          {!result ? (
            <ResultPanel>
              {loading ? (
                <AgentLoadingState label="Compiling immediate action steps..." />
              ) : (
                <AgentEmptyState
                  icon={ShieldWarningIcon}
                  title="Stay calm"
                  description="Enter the details on the left and the AI will generate a mitigation plan."
                />
              )}
            </ResultPanel>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-md border border-danger/20 bg-danger-tint p-5">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-danger">
                    Assessed threat level
                  </p>
                  <Badge variant={threatVariant(result.threat_level)}>
                    <span className="text-sm font-semibold">{result.threat_level}</span>
                  </Badge>
                </div>
                <div className="flex size-12 items-center justify-center rounded-full bg-background">
                  <WarningIcon className="size-6 text-danger" weight="fill" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-6">
                <h3 className="mb-4 border-b border-border pb-3 text-base font-medium text-ink">
                  1. Immediate action steps
                </h3>
                <div className="space-y-4">
                  {result.immediate_actions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-medium text-ink">
                        {step.step_number}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{step.action}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                          Assign to: <span className="text-danger">{step.assigned_to}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-6">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-medium text-ink">2. Guest communication</h3>
                  <button
                    onClick={copyTemplate}
                    className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-border"
                  >
                    <CopyIcon className="size-3.5" /> Copy template
                  </button>
                </div>
                <div className="whitespace-pre-wrap rounded-md border border-border bg-surface p-4 text-sm leading-relaxed text-ink">
                  {result.guest_communication_template}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-6">
                <h3 className="mb-3 border-b border-border pb-3 text-base font-medium text-ink">
                  3. Financial &amp; vendor mitigation
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted">{result.vendor_mitigation_strategy}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
