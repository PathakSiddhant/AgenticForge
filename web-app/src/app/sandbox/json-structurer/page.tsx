"use client";

import { useState } from "react";

import { AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "json-structurer")!;

export default function JsonStructurer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormat = async () => {
    if (!input) return;
    setLoading(true);
    setOutput(null);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOutput(data.structured_data);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/sandbox"
        backLabel="Back to Sandbox"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-border bg-background p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Raw input (text)
          </h2>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 'Priya Sharma is a 28 year old software engineer living in Bengaluru. She knows Python, JavaScript, and loves photography.'"
            className="min-h-75 flex-1"
          />
          <Button onClick={handleFormat} disabled={loading || !input.trim()} className="mt-4">
            {loading ? "Processing..." : "Generate JSON"}
          </Button>
        </div>

        <ResultPanel>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Structured output (JSON)
          </h2>
          <div className="min-h-75 flex-1 overflow-auto rounded-md border border-border bg-background p-4">
            {loading ? (
              <AgentLoadingState label="Structuring..." />
            ) : error ? (
              <p className="text-sm text-danger">{error}</p>
            ) : output ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-accent-ink">
                {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              <p className="font-mono text-sm text-ink-subtle">// Output will appear here...</p>
            )}
          </div>
        </ResultPanel>
      </div>
    </div>
  );
}
