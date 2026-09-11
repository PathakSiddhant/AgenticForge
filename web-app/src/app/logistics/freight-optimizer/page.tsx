"use client";

import { BrainIcon, MapTrifoldIcon, TruckIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "freight-optimizer")!;

interface RouteData {
  recommended_carrier: string;
  estimated_cost_usd: number;
  estimated_transit_days: number;
  optimization_reasoning: string;
}

export default function FreightOptimizerDashboard() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [priority, setPriority] = useState("Standard");
  const [specialHandling, setSpecialHandling] = useState("None");
  const [data, setData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || weight === "") return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logistics/freight-optimizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          package_weight_kg: Number(weight),
          priority_level: priority,
          special_handling: specialHandling,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.route_optimization);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-5">
          <form onSubmit={optimizeRoute} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Origin (city/zip)</Label>
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Jaipur, 302022" disabled={loading} />
              </div>
              <div>
                <Label>Destination (city/zip)</Label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Mumbai, 400001"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <Label>Package weight (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 25"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority level</Label>
                <Select value={priority} onChange={(e) => setPriority(e.target.value)} disabled={loading}>
                  <option value="Standard">Standard (lowest cost)</option>
                  <option value="Express">Express (balanced)</option>
                  <option value="Overnight">Overnight (fastest)</option>
                </Select>
              </div>
              <div>
                <Label>Special handling</Label>
                <Select value={specialHandling} onChange={(e) => setSpecialHandling(e.target.value)} disabled={loading}>
                  <option value="None">None</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Refrigerated">Refrigerated</option>
                  <option value="Hazardous">Hazardous</option>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading || !origin.trim() || !destination.trim() || weight === ""} className="w-full">
              {loading ? "Calculating route..." : "Optimize route"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-7">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Calculating optimal route..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-5">
                <div className="rounded-md border border-accent-tint-border bg-accent-tint p-6 text-center">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-accent-ink">
                    Recommended carrier
                  </span>
                  <div className="flex items-center justify-center gap-3 text-2xl font-semibold text-ink">
                    <TruckIcon className="size-6 text-accent-ink" weight="fill" /> {data.recommended_carrier}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Est. transit time
                    </span>
                    <div className="text-2xl font-semibold text-ink">
                      {data.estimated_transit_days}
                      <span className="text-sm font-medium text-ink-subtle"> days</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                    <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Estimated cost
                    </span>
                    <div className="text-2xl font-semibold text-success">
                      ${data.estimated_cost_usd.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border-l-2 border-l-accent border-y border-r border-border bg-background p-5">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                    <BrainIcon weight="fill" /> Routing logic
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-ink">{data.optimization_reasoning}</p>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={MapTrifoldIcon}
                title="Awaiting shipment details"
                description="Enter origin, destination, and package constraints to generate a route."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
