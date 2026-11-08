"use client";

import { Chip } from "@heroui/react/chip";
import type { ReactNode } from "react";

export function PracticeBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Chip size="sm" variant="soft" className={`practice-badge ${className}`}><Chip.Label>{children}</Chip.Label></Chip>;
}
