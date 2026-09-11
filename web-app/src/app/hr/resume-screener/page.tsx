"use client";

import { CheckCircleIcon, ScalesIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";

import { AgentEmptyState, AgentErrorState, AgentHeader, AgentLoadingState, ResultPanel } from "@/components/agent-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { ALL_AGENTS } from "@/lib/agents";

const agent = ALL_AGENTS.find((a) => a.slug === "resume-screener")!;

interface ScreeningData {
  match_score: number;
  verdict: string;
  key_strengths: string[];
  missing_requirements: string[];
  hr_notes: string;
}

function verdictVariant(verdict: string): "success" | "warning" | "danger" {
  const v = verdict.toLowerCase();
  if (v.includes("strong") || v.includes("hire")) return "success";
  if (v.includes("potential") || v.includes("borderline")) return "warning";
  return "danger";
}

export default function ResumeScreenerDashboard() {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ScreeningData | null>(null);
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

  const analyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || !file) return;

    setLoading(true);
    setError(null);
    setData(null);
    setUploadStatus("Sending PDF to AI engine...");

    try {
      const formData = new FormData();
      formData.append("job_description", jd);
      formData.append("file", file);

      const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hr/resume-screener`, {
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
        backHref="/hr"
        backLabel="Back to HR"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-lg border border-border bg-background p-6">
          <form onSubmit={analyzeResume} className="space-y-5">
            <div>
              <Label>1. Job description (JD)</Label>
              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job requirements here..."
                className="h-32"
                disabled={loading}
              />
            </div>

            <div>
              <Label>2. Upload candidate resume (PDF)</Label>
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
                  <div className="text-center">
                    <CheckCircleIcon className="mx-auto mb-2 size-6 text-success" weight="fill" />
                    <p className="text-sm font-medium text-ink">{file.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">Click to change file</p>
                  </div>
                ) : (
                  <div className="text-center text-ink-subtle">
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="mt-1 text-xs">Strictly PDF files only</p>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading || !jd.trim() || !file} className="w-full">
              {loading ? uploadStatus || "Processing..." : "Upload & generate scorecard"}
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
            <AgentLoadingState label={uploadStatus || "Analyzing resume..."} />
          ) : error ? (
            <AgentErrorState message={error} />
          ) : data ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                  <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Match score
                  </span>
                  <div className="text-4xl font-semibold text-ink">
                    {data.match_score}
                    <span className="text-lg text-ink-subtle">%</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-border bg-background p-5 text-center">
                  <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                    Final verdict
                  </span>
                  <Badge variant={verdictVariant(data.verdict)}>{data.verdict}</Badge>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  HR notes
                </h3>
                <p className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-ink">
                  {data.hr_notes}
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-md border border-success/20 bg-success-tint p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircleIcon weight="fill" /> Key strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {data.key_strengths.map((str, i) => (
                      <li key={i} className="text-sm text-ink">
                        &bull; {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-danger/20 bg-danger-tint p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-danger">
                    <XCircleIcon weight="fill" /> Missing requirements
                  </h4>
                  {data.missing_requirements.length > 0 ? (
                    <ul className="space-y-1.5">
                      {data.missing_requirements.map((req, i) => (
                        <li key={i} className="text-sm text-ink">
                          &bull; {req}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-ink-muted">No major requirements missing.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <AgentEmptyState
              icon={ScalesIcon}
              title="Awaiting resume"
              description="Upload a candidate's PDF resume to automatically parse and score it."
            />
          )}
        </ResultPanel>
      </div>
    </div>
  );
}
