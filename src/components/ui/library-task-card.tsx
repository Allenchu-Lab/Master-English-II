import { Card } from "@heroui/react/card";
import type { ReactNode } from "react";

export function LibraryTaskCard({ summary, status, result, action, className = "" }: {
  summary: ReactNode;
  status: ReactNode;
  result?: ReactNode;
  action: ReactNode;
  className?: string;
}) {
  return <Card className={`library-task-card ${className}`}>
    <div className="library-task-information">
      <div className="library-task-summary">{summary}</div>
      <div className="library-task-status">{status}</div>
    </div>
    <div className="library-task-results">{result}</div>
    <div className="library-task-action">{action}</div>
  </Card>;
}
