"use client";

import { CheckCircleIcon, DnaIcon, FlaskIcon, LightbulbIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "research-analyzer")!;

interface ResearchData {
  paper_title: string;
  core_methodology: string;
  key_findings: string[];
  limitations: string[];
  tldr_summary: string;
}

export default function ResearchAnalyzerDashboard() {
  const [focusArea, setFocusArea] = useState("General Overview");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a valid PDF research paper.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const analyzePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Ingesting research PDF...");

    try {
      const formData = new FormData();
      formData.append("focus_area", focusArea || "General Overview");
      formData.append("file", file);

      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/education/research-analyzer`, {
        method: "POST",
        body: formData,
      });
      const result = await aiRes.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.analysis);
      }
    } catch {
      setError("Couldn't reach the backend. Is ai-engine running?");
    }
    setLoading(false);
    setUploadStatus("");
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <AgentHeader
        icon={agent.icon}
        title={agent.name}
        description={agent.description}
        backHref="/education"
        backLabel="Back to Education"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-fit rounded-lg border border-border bg-background p-6 lg:col-span-1">
          <form onSubmit={analyzePaper} className="space-y-5">
            <div>
              <Label>Upload paper (PDF)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition-colors ${file ? "border-success bg-success-tint" : "border-border hover:border-accent hover:bg-accent-tint"}`}
              >
                <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                {file ? (
                  <div className="px-4 text-center">
                    <CheckCircleIcon className="mx-auto mb-2 size-6 text-success" weight="fill" />
                    <p className="w-48 truncate text-sm font-medium text-ink">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center text-ink-subtle">
                    <p className="text-sm font-medium">Click to upload paper</p>
                    <p className="mt-1 text-xs">First 10 pages will be scanned</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Optional: focus area</Label>
              <Input
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g. Just focus on the datasets used"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading || !file} className="w-full">
              {loading ? uploadStatus || "Analyzing..." : "Analyze paper"}
            </Button>
          </form>
          {error && !loading && (
            <p className="mt-4 rounded-md border border-danger/20 bg-danger-tint p-3 text-sm text-danger">{error}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <ResultPanel>
            {loading ? (
              <AgentLoadingState label={uploadStatus || "Analyzing paper..."} />
            ) : error ? (
              <AgentErrorState message={error} />
            ) : data ? (
              <div className="space-y-6">
                <div className="border-b border-border pb-6">
                  <h2 className="mb-4 text-xl font-semibold leading-tight text-ink">{data.paper_title}</h2>
                  <div className="rounded-md border border-accent-tint-border bg-accent-tint p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent-ink">
                      <LightbulbIcon weight="fill" /> TL;DR summary
                    </h3>
                    <p className="text-sm leading-relaxed text-ink">{data.tldr_summary}</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-base font-medium text-ink">
                    <FlaskIcon /> Core methodology
                  </h3>
                  <p className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-ink-muted">
                    {data.core_methodology}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-base font-medium text-ink">
                      <DnaIcon /> Key findings
                    </h3>
                    <ul className="space-y-2">
                      {data.key_findings.map((finding, i) => (
                        <li key={i} className="rounded-md border border-border bg-background p-3 text-sm text-ink">
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-base font-medium text-ink">
                      <WarningIcon /> Limitations
                    </h3>
                    <ul className="space-y-2">
                      {data.limitations.map((lim, i) => (
                        <li key={i} className="rounded-md border border-border bg-background p-3 text-sm text-ink">
                          {lim}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <AgentEmptyState
                icon={DnaIcon}
                title="Awaiting research paper"
                description="Upload an academic PDF to extract methodology, findings, and a summary."
              />
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}
