"use client";

import { ClockIcon, CopyIcon, FireIcon, NotePencilIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { toast } from "sonner";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "raw-scriptwriter")!;

interface ScriptData {
  video_title_ideas: string[];
  full_script: string;
  pacing_notes: string;
}

export default function RawScriptwriterDashboard() {
  const [coreTopic, setCoreTopic] = useState("");
  const [approvedHook, setApprovedHook] = useState("");
  const [targetLength, setTargetLength] = useState<number | "">("");
  const [creatorVibe, setCreatorVibe] = useState("High energy and hype");
  const [data, setData] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreTopic.trim() || !approvedHook.trim() || targetLength === "") return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/raw-scriptwriter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          core_topic: coreTopic,
          approved_hook: approvedHook,
          target_length_minutes: Number(targetLength),
          creator_vibe: creatorVibe,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.script_content);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Script copied to clipboard.");
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/media"
        backLabel="Back to Media"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-4">
          <form onSubmit={generateScript} className="space-y-5">
            <div>
              <Label>Core topic / idea</Label>
              <Textarea
                value={coreTopic}
                onChange={(e) => setCoreTopic(e.target.value)}
                placeholder="e.g. Tactical breakdown of Messi's False 9 role."
                className="h-24"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Approved hook (first 5 seconds)</Label>
              <Textarea
                value={approvedHook}
                onChange={(e) => setApprovedHook(e.target.value)}
                placeholder="Paste the hook from the Viral Hook Architect here..."
                className="h-24"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target length (mins)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={targetLength}
                  onChange={(e) => setTargetLength(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 1.5"
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Creator vibe</Label>
                <Select value={creatorVibe} onChange={(e) => setCreatorVibe(e.target.value)} disabled={loading}>
                  <option value="Aggressive sports fan">Aggressive &amp; hype</option>
                  <option value="Analytical and calm">Analytical &amp; calm</option>
                  <option value="Storytelling and mysterious">Storytelling</option>
                  <option value="Casual and funny">Casual &amp; funny</option>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !coreTopic.trim() || !approvedHook.trim() || targetLength === ""}
              className="w-full"
            >
              {loading ? "Writing script..." : "Draft full script"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-8">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label="Writing your script..." />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-border bg-background p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      <FireIcon weight="fill" /> Clickable title ideas
                    </h3>
                    <ul className="space-y-2">
                      {data.video_title_ideas.map((title, i) => (
                        <li key={i} className="border-l-2 border-accent py-1 pl-3 text-sm font-medium text-ink">
                          {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-md border border-accent-tint-border bg-accent-tint p-5">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                      <ClockIcon weight="fill" /> Delivery &amp; pacing notes
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-ink">{data.pacing_notes}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      <NotePencilIcon className="size-3.5" /> Master script document
                    </span>
                    <button
                      onClick={() => copyToClipboard(data.full_script)}
                      className="flex items-center gap-1 text-xs font-medium text-accent-ink hover:underline"
                    >
                      <CopyIcon className="size-3.5" /> Copy script
                    </button>
                  </div>
                  <div className="max-h-125 overflow-y-auto custom-scrollbar whitespace-pre-wrap p-6 text-base leading-relaxed text-ink">
                    {data.full_script}
                  </div>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={NotePencilIcon}
                title="Writer's room empty"
                description="Paste your topic and winning hook to generate a full script."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
