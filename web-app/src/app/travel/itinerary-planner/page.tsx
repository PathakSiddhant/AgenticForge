"use client";

import { AirplaneTiltIcon, LightbulbIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "itinerary-planner")!;

interface Activity {
  time: string;
  activity_name: string;
  description: string;
  estimated_cost_usd: number;
}
interface ItineraryDay {
  day_number: number;
  daily_theme: string;
  total_daily_cost: number;
  activities: Activity[];
}
interface TravelPlan {
  total_estimated_budget: number;
  vibe_match_score: number;
  expert_tip: string;
  itinerary: ItineraryDay[];
}

export default function ItineraryPlanner() {
  const [formData, setFormData] = useState({
    destination: "",
    days: 3,
    budget_level: "Mid-Range",
    vibe: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TravelPlan | null>(null);
  const [error, setError] = useState("");

  const generateItinerary = async () => {
    if (!formData.destination || !formData.vibe) {
      setError("Destination and vibe are required.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/travel/itinerary-planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: formData.destination,
          days: Number(formData.days),
          budget_level: formData.budget_level,
          vibe: formData.vibe,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.travel_plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
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
            <Label>Destination</Label>
            <Input
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g. Kyoto, Japan"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Days</Label>
              <Input
                type="number"
                min={1}
                max={14}
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Budget</Label>
              <Select
                value={formData.budget_level}
                onChange={(e) => setFormData({ ...formData, budget_level: e.target.value })}
              >
                <option>Backpacker</option>
                <option>Mid-Range</option>
                <option>Luxury</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>The vibe</Label>
            <Textarea
              value={formData.vibe}
              onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
              placeholder="e.g. Hardcore nightlife and street food, strictly no morning temples."
              rows={3}
            />
          </div>
          <Button onClick={generateItinerary} disabled={loading} className="w-full">
            {loading ? "Planning your trip..." : "Generate itinerary"}
          </Button>
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
        </div>

        <div className="lg:col-span-2">
          {!result ? (
            <ResultPanel>
              {loading ? (
                <AgentLoadingState label="Calculating routes & costs..." />
              ) : (
                <AgentEmptyState
                  icon={AirplaneTiltIcon}
                  title="Ready to plan"
                  description="Enter your details to generate a day-by-day itinerary."
                />
              )}
            </ResultPanel>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-md border border-border bg-background p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Total est. cost
                  </p>
                  <p className="text-2xl font-semibold text-ink">${result.total_estimated_budget}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Vibe match
                  </p>
                  <p className="text-2xl font-semibold text-success">{result.vibe_match_score}%</p>
                </div>
                <div className="col-span-2 rounded-md border border-accent-tint-border bg-accent-tint p-4 md:col-span-1">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                    <LightbulbIcon weight="fill" /> Expert tip
                  </p>
                  <p className="text-sm font-medium leading-tight text-ink">{result.expert_tip}</p>
                </div>
              </div>

              <div className="space-y-4">
                {result.itinerary.map((day, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
                      <h3 className="text-base font-medium text-ink">
                        Day {day.day_number}: {day.daily_theme}
                      </h3>
                      <span className="rounded-md border border-border bg-background px-3 py-1 font-mono text-sm font-semibold text-ink">
                        ${day.total_daily_cost}
                      </span>
                    </div>
                    <div className="space-y-6 p-6">
                      {day.activities.map((act, aIdx) => (
                        <div key={aIdx} className="relative flex gap-4">
                          {aIdx !== day.activities.length - 1 && (
                            <div className="absolute -bottom-6 left-9 top-10 w-px bg-border" />
                          )}
                          <div className="w-16 shrink-0 pt-1 text-right">
                            <span className="text-xs font-semibold text-ink-subtle">{act.time}</span>
                          </div>
                          <div className="z-10 mt-1.5 size-3 shrink-0 rounded-full bg-accent" />
                          <div className="flex-1 pb-2">
                            <div className="mb-1 flex items-start justify-between">
                              <h4 className="text-sm font-medium text-ink">{act.activity_name}</h4>
                              <span className="rounded bg-success-tint px-2 py-0.5 font-mono text-xs font-semibold text-success">
                                ${act.estimated_cost_usd}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-ink-muted">{act.description}</p>
                          </div>
                        </div>
                      ))}
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
