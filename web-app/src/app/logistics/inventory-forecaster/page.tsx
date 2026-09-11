"use client";

import { BrainIcon, PackageIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "inventory-forecaster")!;

interface ForecastData {
  recommended_order_quantity: number;
  stockout_risk: string;
  estimated_depletion_days: number;
  strategic_reasoning: string;
}

function riskVariant(risk: string): "danger" | "warning" | "success" {
  const r = risk.toLowerCase();
  if (r.includes("high")) return "danger";
  if (r.includes("medium")) return "warning";
  return "success";
}

export default function InventoryForecasterDashboard() {
  const [itemName, setItemName] = useState("");
  const [currentStock, setCurrentStock] = useState<number | "">("");
  const [dailyUsage, setDailyUsage] = useState("");
  const [leadTime, setLeadTime] = useState<number | "">("");
  const [marketConditions, setMarketConditions] = useState("Normal operations");
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || currentStock === "" || !dailyUsage.trim() || leadTime === "") return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logistics/inventory-forecaster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: itemName,
          current_stock: Number(currentStock),
          historical_daily_usage: dailyUsage,
          supplier_lead_time_days: Number(leadTime),
          market_conditions: marketConditions,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.forecast);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={runForecast} className="space-y-5">
            <div>
              <Label>Item / SKU name</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Industrial Detergent (50L Drums)"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current stock</Label>
                <Input
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Units"
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Lead time (days)</Label>
                <Input
                  type="number"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Days to arrive"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <Label>Historical daily usage</Label>
              <Textarea
                value={dailyUsage}
                onChange={(e) => setDailyUsage(e.target.value)}
                placeholder="e.g. We use about 5 drums per day. Peak usage is 10/day."
                className="h-24"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Market conditions / notes</Label>
              <Textarea
                value={marketConditions}
                onChange={(e) => setMarketConditions(e.target.value)}
                placeholder="e.g. Big holiday weekend coming up, expect 20% more usage."
                className="h-24"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !itemName.trim() || currentStock === "" || !dailyUsage.trim() || leadTime === ""}
              className="w-full"
            >
              {loading ? "Calculating..." : "Run forecast"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <ResultPanel>
          {loading ? (
            <AgentLoadingState label="Running forecast..." />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Days until depletion
                  </span>
                  <div className="text-3xl font-semibold text-ink">
                    {data.estimated_depletion_days}
                    <span className="text-base font-medium text-ink-subtle"> days</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                  <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Stockout risk
                  </span>
                  <Badge variant={riskVariant(data.stockout_risk)}>{data.stockout_risk}</Badge>
                </div>
              </div>

              <div className="rounded-md border border-accent-tint-border bg-accent-tint p-6 text-center">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                  Recommended order quantity
                </h3>
                <div className="text-4xl font-semibold text-accent-ink">
                  {data.recommended_order_quantity}
                  <span className="text-lg font-medium opacity-80"> units</span>
                </div>
              </div>

              <div className="rounded-md border-l-2 border-l-accent border-y border-r border-border bg-background p-5">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                  <BrainIcon weight="fill" /> AI strategic reasoning
                </h3>
                <p className="text-sm font-medium leading-relaxed text-ink">{data.strategic_reasoning}</p>
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={PackageIcon}
              title="Warehouse ready"
              description="Enter inventory data to generate reorder predictions and prevent stockouts."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
