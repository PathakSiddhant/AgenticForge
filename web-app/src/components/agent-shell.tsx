"use client";

import { ArrowLeftIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Icon } from "@phosphor-icons/react";

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
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4 flex size-16 items-center justify-center rounded-full bg-background text-ink-subtle"
      >
        <EmptyIcon className="size-7" />
      </motion.div>
      <h3 className="text-[15px] font-medium text-ink-muted">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-subtle">{description}</p>
    </div>
  );
}

// Every agent page already passes a specific final-state label (e.g. "Running
// risk analysis..."). Rather than a static spinner, walk through a couple of
// generic "what the agent is doing" stages first and land on that label -
// this is what turns "textbox -> spinner -> result" into something that
// reads as active and understandable without exposing real internal
// reasoning (see DESIGN.md / the AI UX brief this implements).
const LEADING_STAGES = ["Reading your input", "Thinking it through"];

export function AgentLoadingState({ label = "Analyzing..." }: { label?: string }) {
  const stages = [...LEADING_STAGES, label];
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(prefersReducedMotion ? stages.length - 1 : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    setIndex(0);
    const timers = stages.slice(0, -1).map((_, i) =>
      setTimeout(() => setIndex(i + 1), (i + 1) * 850)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, prefersReducedMotion]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
      <div className="relative size-7">
        <div className="absolute inset-0 rounded-full border-2 border-border-strong" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
      </div>
      <div className="mt-4 h-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm font-medium text-ink-muted"
          >
            {stages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
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
