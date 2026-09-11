"use client";

import {
  ArrowsClockwiseIcon,
  DeviceMobileIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { toast } from "sonner";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "content-repurposer")!;

interface RepurposeData {
  twitter_thread: string[];
  linkedin_post: string;
  short_form_script: string;
}

export default function ContentRepurposerDashboard() {
  const [sourceContent, setSourceContent] = useState("");
  const [coreMessage, setCoreMessage] = useState("");
  const [data, setData] = useState<RepurposeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repurposeContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceContent.trim() || !coreMessage.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/content-repurposer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_content: sourceContent, core_message: coreMessage }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.repurposed_content);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${platform} content copied to clipboard.`);
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="h-fit rounded-lg border border-border bg-background p-6 xl:col-span-4">
          <form onSubmit={repurposeContent} className="space-y-5">
            <div>
              <Label>Core message / takeaway</Label>
              <Input
                value={coreMessage}
                onChange={(e) => setCoreMessage(e.target.value)}
                placeholder="e.g. Consistency is more important than intensity."
                disabled={loading}
              />
            </div>
            <div>
              <Label>Source content (transcript/article)</Label>
              <Textarea
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste your YouTube transcript, blog post, or brain dump here..."
                className="h-64"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !sourceContent.trim() || !coreMessage.trim()} className="w-full">
              {loading ? "Generating content..." : "Repurpose everywhere"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="xl:col-span-8">
          {loading || error || !data ? (
            <ResultPanel>
              {loading ? (
                <AgentLoadingState label="Repurposing your content..." />
              ) : error ? (
                <AgentErrorState message={error} />
              ) : (
                <AgentEmptyState
                  icon={ArrowsClockwiseIcon}
                  title="Content multiplier"
                  description="Paste a long-form script to generate native content for every platform."
                />
              )}
            </ResultPanel>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-5 md:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
                    <XLogoIcon weight="fill" /> X / Twitter thread
                  </h3>
                  <button
                    onClick={() => copyToClipboard(data.twitter_thread.join("\n\n"), "Twitter")}
                    className="text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    Copy all
                  </button>
                </div>
                <div className="space-y-3">
                  {data.twitter_thread.map((tweet, i) => (
                    <div key={i} className="relative rounded-md border border-border bg-background p-4">
                      <span className="absolute right-4 top-4 text-xs font-medium text-ink-subtle">
                        {i + 1}/{data.twitter_thread.length}
                      </span>
                      <p className="whitespace-pre-wrap pr-8 text-sm text-ink">{tweet}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-fit rounded-lg border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
                    <LinkedinLogoIcon weight="fill" /> LinkedIn story
                  </h3>
                  <button
                    onClick={() => copyToClipboard(data.linkedin_post, "LinkedIn")}
                    className="text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    Copy
                  </button>
                </div>
                <div className="rounded-md border border-border bg-background p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{data.linkedin_post}</p>
                </div>
              </div>

              <div className="h-fit rounded-lg border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
                    <DeviceMobileIcon weight="fill" /> Shorts/Reels script (45s)
                  </h3>
                  <button
                    onClick={() => copyToClipboard(data.short_form_script, "Shorts")}
                    className="text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    Copy
                  </button>
                </div>
                <div className="rounded-md border-l-2 border-l-accent border-y border-r border-border bg-background p-4">
                  <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-ink">
                    {data.short_form_script}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
