"use client";

import {
  ArrowLeftIcon,
  BrainIcon,
  CheckIcon,
  CpuIcon,
  EyeIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export function AgentHeader({
  icon: HeaderIcon,
  title,
  description,
  backHref,
  backLabel,
}: {
  icon: Icon;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mb-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="size-3.5" /> {backLabel}
      </Link>
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent-ink">
          <HeaderIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ResultPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface p-6">
      {children}
    </div>
  );
}

export function AgentEmptyState({
  icon: EmptyIcon,
  title,
  description,
}: {
  icon: Icon;
  title: string;
  description: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4"
      >
        {/* A waiting agent isn't dead weight - a slow, near-imperceptible
            breathing loop is what separates "empty" from "idle". */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="flex size-16 items-center justify-center rounded-full bg-background text-ink-subtle"
        >
          <EmptyIcon className="size-7" />
        </motion.div>
      </motion.div>
      <h3 className="text-[15px] font-medium text-ink-muted">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-subtle">{description}</p>
    </div>
  );
}

// Every agent page passes a specific final-stage label (e.g. "Running risk
// analysis..."). Rather than a bare spinner, render the whole thing as a
// small reasoning trace - reading, thinking, then the page-specific work -
// so the agent visibly *does something* instead of just "loading". This is
// the shared visual language for "the agent is alive", used by every agent
// page with zero per-page changes; a page can optionally pass its own
// `icon` for the final stage to make that stage read more specifically.
interface LoadingStage {
  label: string;
  icon: Icon;
}

function buildLoadingStages(label: string, icon?: Icon): LoadingStage[] {
  // Many page-specific labels already end in "..." from the old plain-text
  // design; the animated LoadingDots suffix replaces that, so strip it to
  // avoid a doubled ellipsis.
  const cleanLabel = label.replace(/(\.{3}|…)\s*$/, "").trim();
  return [
    { label: "Reading your input", icon: EyeIcon },
    { label: "Thinking it through", icon: BrainIcon },
    { label: cleanLabel, icon: icon ?? CpuIcon },
  ];
}

function LoadingDots() {
  return (
    <span className="ml-0.5 inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

export function AgentLoadingState({
  label = "Analyzing...",
  icon,
}: {
  label?: string;
  icon?: Icon;
}) {
  const stages = buildLoadingStages(label, icon);
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(prefersReducedMotion ? stages.length - 1 : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    setIndex(0);
    const timers = stages
      .slice(0, -1)
      .map((_, i) => setTimeout(() => setIndex(i + 1), (i + 1) * 900));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, prefersReducedMotion]);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 items-center justify-center p-10"
    >
      <div className="w-full max-w-60">
        {stages.map((stage, i) => {
          const StageIcon = stage.icon;
          const status = i < index ? "done" : i === index ? "active" : "pending";
          const isLast = i === stages.length - 1;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                    status === "done" &&
                      "border-accent bg-accent-tint text-accent-ink",
                    status === "active" && "border-accent bg-background text-accent",
                    status === "pending" && "border-border bg-background text-ink-subtle"
                  )}
                >
                  {status === "active" && !prefersReducedMotion && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-accent"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.7 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  {status === "done" ? (
                    <CheckIcon className="size-4" weight="bold" />
                  ) : (
                    <StageIcon
                      className="size-4"
                      weight={status === "active" ? "fill" : "regular"}
                    />
                  )}
                </div>
                {!isLast && (
                  <div className="my-0.5 w-px flex-1" style={{ minHeight: 22 }}>
                    <div
                      className={cn(
                        "h-full w-full transition-colors duration-500",
                        status === "done" ? "bg-accent" : "bg-border"
                      )}
                    />
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "flex pb-6 pt-1 text-left text-sm font-medium transition-colors duration-300",
                  status === "pending" ? "text-ink-subtle" : "text-ink"
                )}
              >
                {stage.label}
                {status === "active" && !prefersReducedMotion && <LoadingDots />}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function AgentErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  // Never render a raw backend/exception string as-is: map anything that
  // looks like an internal error to one honest, generic sentence instead.
  const looksInternal =
    /error|exception|traceback|resource_exhausted|rate.?limit|timeout|5\d\d/i.test(
      message
    ) && message.length > 80;
  const friendlyMessage = looksInternal
    ? "The AI service hit a snag processing this request. This is usually temporary."
    : message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-1 flex-col items-center justify-center p-10 text-center"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger">
        <WarningCircleIcon className="size-6" weight="fill" />
      </div>
      <h3 className="text-[15px] font-medium text-ink">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{friendlyMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md border border-border-strong px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-background"
        >
          Try again
        </button>
      )}
    </motion.div>
  );
}
