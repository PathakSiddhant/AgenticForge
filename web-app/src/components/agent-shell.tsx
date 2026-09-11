import { ArrowLeftIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

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
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-background text-ink-subtle">
        <EmptyIcon className="size-7" />
      </div>
      <h3 className="text-[15px] font-medium text-ink-muted">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-ink-subtle">{description}</p>
    </div>
  );
}

export function AgentLoadingState({ label = "Analyzing..." }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
      <div className="size-6 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
      <p className="mt-4 text-sm font-medium text-ink-muted">{label}</p>
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
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
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
    </div>
  );
}
