"use client";

import { Checkbox } from "@heroui/react/checkbox";
import type { ReactNode } from "react";

// Existing exam controls allow selecting the current option again to clear it.
export function PracticeChoice({ children, className = "", selected, disabled, onChange }: {
  children: ReactNode;
  className?: string;
  selected: boolean;
  disabled?: boolean;
  onChange(): void;
}) {
  return <Checkbox className="practice-choice" isSelected={selected} isDisabled={disabled} onChange={onChange}>
    <Checkbox.Content className={`practice-choice-control ${className}`}>{children}</Checkbox.Content>
  </Checkbox>;
}
