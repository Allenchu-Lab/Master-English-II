import { Chip } from "@heroui/react/chip";
import type { ReactNode } from "react";

export function CompletionBadge({ children }: { children: ReactNode }) {
  return <Chip className="completion-badge"><Chip.Label>{children}</Chip.Label></Chip>;
}
