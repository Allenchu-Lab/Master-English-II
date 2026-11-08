"use client";

import { Button as HeroButton } from "@heroui/react/button";
import type { ComponentProps, MouseEventHandler, MouseEvent, AriaRole } from "react";

type Props = Omit<ComponentProps<typeof HeroButton>, "className" | "onClick"> & {
  className?: string;
  disabled?: boolean;
  title?: string;
  role?: AriaRole;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

// Keep existing business handlers and native form behavior during the UI migration.
export function Button({ disabled, isDisabled, className = "", onClick, type = "button", ...props }: Props) {
  return <HeroButton {...props} onClick={onClick ? (event) => onClick(event as MouseEvent<HTMLButtonElement>) : undefined} type={type} isDisabled={disabled || isDisabled} variant={props.variant ?? "ghost"} className={`chitou-button ${className}`} />;
}
