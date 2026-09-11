"use client";

import { FilmSlateIcon, FireIcon, LightbulbIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "viral-hook")!;

interface HookOption {
  hook_type: string;
  audio_script: string;
  visual_action: string;
}
interface HookData {
  top_hooks: HookOption[];
  target_emotion: string;
  retention_tip: string;
}

export default function ViralHookDashboard() {
  const [coreTopic, setCoreTopic] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("YouTube Shorts / Reels");
  const [creatorVibe, setCreatorVibe] = useState("High energy and hype");
  const [data, setData] = useState<HookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreTopic.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/viral-hook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ core_topic: coreTopic, target_platform: targetPlatform, creator_vibe: creatorVibe }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.hook_strategy);
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
        backHref="/media"
        backLabel="Back to Media"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-4">
          <form onSubmit={generateHook} className="space-y-5">
            <div>
              <Label>Core topic / idea</Label>
              <Textarea
                value={coreTopic}
                onChange={(e) => setCoreTopic(e.target.value)}
                placeholder="e.g. Why Messi's 2012 season will never be repeated."
                className="h-32"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Target platform</Label>
              <Select value={targetPlatform} onChange={(e) => setTargetPlatform(e.target.value)} disabled={loading}>
                <option value="YouTube Shorts / Reels">Shorts / Reels (under 60s)</option>
                <option value="YouTube Long Form">YouTube long form (8m+)</option>
                <option value="Twitter / X Video">Twitter / X native video</option>
              </Select>
            </div>
            <div>
              <Label>Creator vibe / tone</Label>
              <Select value={creatorVibe} onChange={(e) => setCreatorVibe(e.target.value)} disabled={loading}>
                <option value="High energy and hype">High energy &amp; hype</option>
                <option value="Analytical and calm">Analytical &amp; calm</option>
                <option value="Aggressive and opinionated">Aggressive &amp; opinionated</option>
                <option value="Storytelling and mysterious">Storytelling &amp; mysterious</option>
              </Select>
            </div>
            <Button type="submit" disabled={loading || !coreTopic.trim()} className="w-full">
              {loading ? "Brainstorming..." : "Generate hooks"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-8">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Brainstorming hooks..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1 rounded-md border-l-2 border-l-accent border-y border-r border-border bg-background p-4">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                      Target emotion
                    </span>
                    <span className="text-base font-medium text-accent-ink">{data.target_emotion}</span>
                  </div>
                  <div className="flex-2 rounded-md border border-accent-tint-border bg-accent-tint p-4">
                    <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                      <LightbulbIcon weight="fill" /> Retention tip
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-ink">{data.retention_tip}</span>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                    <FireIcon weight="fill" /> Top hook variations
                  </h3>
                  <div className="space-y-3">
                    {data.top_hooks.map((hook, index) => (
                      <div
                        key={index}
                        className="flex flex-col overflow-hidden rounded-md border border-border bg-background sm:flex-row"
                      >
                        <div className="border-b border-border bg-surface p-4 sm:w-1/3 sm:border-b-0 sm:border-r">
                          <Badge variant="neutral" className="mb-3">
                            {hook.hook_type}
                          </Badge>
                          <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                            Visual action
                          </h4>
                          <p className="text-sm italic text-ink-muted">{hook.visual_action}</p>
                        </div>
                        <div className="p-4 sm:w-2/3">
                          <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                            Audio script (0-3s)
                          </h4>
                          <p className="text-base font-medium leading-relaxed text-ink">
                            &quot;{hook.audio_script}&quot;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={FilmSlateIcon}
                title="Ready to go viral"
                description="Enter your video topic to generate punchy, high-retention hooks."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
