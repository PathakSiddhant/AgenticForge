"use client";

import { BookmarkSimpleIcon, CheckCircleIcon, ChatTeardropTextIcon } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "onboarding-rag")!;

interface OnboardingData {
  answer: string;
  policy_reference: string;
  confidence: string;
}

function confidenceVariant(level: string): "success" | "warning" | "danger" {
  const l = level.toLowerCase();
  if (l.includes("high")) return "success";
  if (l.includes("medium")) return "warning";
  return "danger";
}

export default function OnboardingRagDashboard() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const askAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !file) return;
    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Reading company manual...");

    try {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("file", file);

      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/onboarding-rag`, {
        method: "POST",
        body: formData,
      });
      const result = await aiRes.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.response);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
    setUploadStatus("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/hr"
        backLabel="Back to HR"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={askAssistant} className="space-y-5">
            <div>
              <Label>1. Upload company manual (PDF)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors ${file ? "border-success bg-success-tint" : "border-border hover:border-accent hover:bg-accent-tint"}`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="px-4 text-center">
                    <CheckCircleIcon className="mx-auto mb-2 size-6 text-success" weight="fill" />
                    <p className="w-48 truncate text-sm font-medium text-ink">{file.name}</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-ink-subtle">Click to upload policy PDF</p>
                )}
              </div>
            </div>
            <div>
              <Label>2. Employee query</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. How many sick leaves do I get in a year?"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim() || !file} className="w-full">
              {loading ? uploadStatus || "Thinking..." : "Ask HR assistant"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <ResultPanel>
          {loading ? (
            <AgentLoadingState label={uploadStatus || "Searching the manual..."} />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="flex items-center gap-2 text-sm font-medium text-ink">
                  <ChatTeardropTextIcon /> AI response
                </h2>
                <Badge variant={confidenceVariant(data.confidence)}>{data.confidence} confidence</Badge>
              </div>
              <p className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-ink">
                {data.answer}
              </p>
              <div className="rounded-md border border-accent-tint-border bg-accent-tint p-4">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                  <BookmarkSimpleIcon weight="fill" /> Official policy reference
                </h4>
                <p className="border-l-2 border-accent-tint-border pl-3 text-sm italic text-ink-muted">
                  &quot;{data.policy_reference}&quot;
                </p>
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={ChatTeardropTextIcon}
              title="Ready to help"
              description="Upload the company manual and ask a question for a policy-backed answer."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
