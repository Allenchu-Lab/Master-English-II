"use client";

import { ProgressBar } from "@heroui/react/progress-bar";

export function PracticeProgress({ value, total, label }: { value: number; total: number; label: string }) {
  return <ProgressBar className="practice-progress-component" aria-label={label} value={value} maxValue={total || 1}>
    <ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track>
  </ProgressBar>;
}
