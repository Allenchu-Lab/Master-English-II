import type { ReactNode } from "react";

export function DraftStatus({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "error" | "warning" }) {
  return <footer className="reading-b-save draft-status" data-tone={tone} role="status">{children}</footer>;
}
