"use client";
import { useEffect, useState } from "react";
import { Link } from "@heroui/react/link";
import { ArrowRight } from "lucide-react";

type Resume = { kind: string; year: number; detail: string | null; href: string };
const labels: Record<string, [string, string]> = { reading_a: ["阅读 A", "Reading A"], reading_b: ["阅读 B", "Reading B"], cloze: ["完形填空", "Cloze"], translation: ["翻译", "Translation"], writing: ["写作", "Writing"] };
export function ResumePractice({ english, revision }: { english: boolean; revision: number }) {
  const [resume, setResume] = useState<Resume | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/resume-practice", { signal: controller.signal, cache: "no-store" }).then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => setResume(data.resume)).catch(() => { if (!controller.signal.aborted) setResume(null); });
    return () => controller.abort();
  }, [revision]);
  if (!resume || !labels[resume.kind]) return null;
  const detail = resume.detail ? (resume.kind === "writing" ? `Part ${resume.detail}` : `Text ${resume.detail.padStart(2, "0")}`) : null;
  return <Link className="resume-practice" href={`${resume.href}${english ? (resume.href.includes("?") ? "&lang=en" : "?lang=en") : ""}`}>
    <span className="resume-practice-icon"><ArrowRight aria-hidden="true" /></span>
    <span className="resume-practice-copy"><strong>{english ? "Continue" : "继续"}</strong><span>{[resume.year, labels[resume.kind][english ? 1 : 0], detail].filter(Boolean).join(" · ")}</span></span>
  </Link>;
}
