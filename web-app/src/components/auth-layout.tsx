import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import { ALL_AGENTS } from "@/lib/agents";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative size-9">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>
          <span className="text-base font-semibold tracking-tight text-background">
            AgenticForge
          </span>
        </Link>

        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-background">
            {ALL_AGENTS.length} specialized agents, plus two complete
            AI-run workflows.
          </h1>
          <ul className="mt-6 space-y-3">
            {[
              "LeadForge - AI SDR and CRM pipeline",
              "MediForge - AI reception across chat, WhatsApp, and voice",
              "One workspace for every agent you deploy",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-background/70"
              >
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-background/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-background/40">
          &copy; {new Date().getFullYear()} AgenticForge
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        {children}
      </div>
    </div>
  );
}
