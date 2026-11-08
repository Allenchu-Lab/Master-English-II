"use client";

import Link from "next/link";
import { buttonVariants } from "@heroui/styles";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type PracticeAction = {
  id: string;
  label: ReactNode;
  variant: "primary" | "secondary";
} & ({ href: string; onPress?: never; disabled?: never; busy?: never } | { href?: never; onPress(): void; disabled?: boolean; busy?: boolean });

export function PracticeActionBar({ summary, tone = "default", actions }: {
  summary?: ReactNode;
  tone?: "default" | "error" | "warning";
  actions: PracticeAction[];
}) {
  return <footer className="practice-action-bar" data-tone={tone}>
    <div className="practice-action-bar-summary" aria-live="polite">{summary}</div>
    {actions.length > 0 && <div className="practice-action-bar-actions">
      {actions.map(action => action.href !== undefined
        ? <Link key={action.id} className={buttonVariants({ variant: action.variant })} href={action.href}>{action.label}</Link>
        : <Button key={action.id} variant={action.variant} disabled={action.disabled || action.busy} aria-busy={action.busy} onClick={action.onPress}>{action.label}</Button>)}
    </div>}
  </footer>;
}
