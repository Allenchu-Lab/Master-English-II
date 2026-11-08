"use client";

import { Alert } from "@heroui/react/alert";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export function PracticeNotice({ children }: { children: ReactNode }) {
  return <Alert status="danger" role="alert" className="practice-notice">
    <Alert.Indicator><AlertCircle aria-hidden="true" /></Alert.Indicator>
    <Alert.Content><Alert.Description>{children}</Alert.Description></Alert.Content>
  </Alert>;
}
