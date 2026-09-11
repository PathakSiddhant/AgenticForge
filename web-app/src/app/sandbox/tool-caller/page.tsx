"use client";

import { RobotIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "tool-caller")!;

export default function ToolCaller() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!input) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setResponse(data.reply || "The AI couldn't process that - try rephrasing.");
    } catch {
      setResponse("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description="Ask general questions, or ask for the price of Bitcoin, Ethereum, Solana, or Dogecoin to watch the AI trigger a real function call."
        backHref="/sandbox"
        backLabel="Back to Sandbox"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-border bg-background p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Your command
          </h2>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 'What is Agentic AI?' or 'Fetch the current price of Ethereum please!'"
            className="min-h-50 flex-1"
          />
          <Button onClick={handleAction} disabled={loading || !input.trim()} className="mt-4">
            {loading ? "Executing..." : "Send to AI"}
          </Button>
        </div>

        <ResultPanel>
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            <RobotIcon className="size-3.5" /> AI response
          </h2>
          <div className="min-h-50 flex-1 overflow-auto rounded-md border border-border bg-background p-4">
            {loading ? (
              <AgentLoadingState />
            ) : response ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{response}</p>
            ) : (
              <p className="font-mono text-sm text-ink-subtle">Waiting for your command...</p>
            )}
          </div>
        </ResultPanel>
      </div>
    </div>
  );
}
