import type { ReactNode } from "react";
import { PracticeAccess } from "@/components/practice-access";

export default function Layout({ children }: { children: ReactNode }) {
  return <PracticeAccess>{children}</PracticeAccess>;
}
