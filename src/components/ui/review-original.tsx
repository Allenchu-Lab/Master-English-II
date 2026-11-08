import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function ReviewOriginal({ label, children }: { label: string; children: ReactNode }) {
  return <details className="review-original-card"><summary><span>{label}</span><ChevronDown aria-hidden="true" /></summary><div>{children}</div></details>;
}
