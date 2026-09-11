"use client";

import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "document-reader")!;

export default function DocumentReader() {
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!documentText || !question) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_text: documentText, question }),
      });
      const data = await res.json();
      setResponse(data.reply || "The AI couldn't find an answer - try rephrasing the question.");
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
        description="Paste a source text, then ask a question. The AI answers strictly from the provided text."
        backHref="/sandbox"
        backLabel="Back to Sandbox"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6">
          <div>
            <Label>1. The source document</Label>
            <Textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste a long paragraph or article here..."
              className="h-48"
            />
          </div>
          <div>
            <Label>2. Your question</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the main topic of the text?"
            />
          </div>
          <Button onClick={handleAsk} disabled={loading || !documentText || !question} className="mt-1">
            {loading ? "Reading document..." : "Find answer"}
          </Button>
        </div>

        <ResultPanel>
          <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            <SparkleIcon className="size-3.5" /> Extracted answer
          </h2>
          <div className="min-h-50 flex-1 overflow-auto rounded-md border border-border bg-background p-4">
            {loading ? (
              <AgentLoadingState label="Reading document..." />
            ) : response ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{response}</p>
            ) : (
              <p className="font-mono text-sm text-ink-subtle">
                Provide a document and a question to see the answer...
              </p>
            )}
          </div>
        </ResultPanel>
      </div>
    </div>
  );
}
