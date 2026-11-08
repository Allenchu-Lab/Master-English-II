"use client";

import { useEffect, useState } from "react";
import { runtimeTokens } from "@/styles/runtime-tokens";

export function BuddySpeech({ message, reserveMessages = [message] }: { message: string; reserveMessages?: readonly string[] }) {
  const [visible, setVisible] = useState<string | null>("");
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    const letters = Array.from(message);
    let count = 0;
    const reveal = () => {
      count++;
      setVisible(letters.slice(0, count).join(""));
      if (count < letters.length) timer = setTimeout(reveal, runtimeTokens.buddy.characterMs);
    };
    const start = () => {
      clearTimeout(timer);
      if (preference.matches) { setVisible(null); return; }
      setVisible(""); count = 0;
      timer = setTimeout(reveal, runtimeTokens.buddy.speechDelayMs);
    };
    start();
    preference.addEventListener("change", start);
    return () => { clearTimeout(timer); preference.removeEventListener("change", start); };
  }, [message]);
  const text = visible ?? message;
  const complete = text === message;
  return <p className="home-buddy-speech">
    <svg className="buddy-speech-shape" viewBox="0 0 260 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path vectorEffect="non-scaling-stroke" d="M32 1H214C232 1 246 13 246 30V59Q249 69 259 74Q248 80 241 76C235 91 224 99 208 99H32C14 99 1 86 1 68V32C1 14 14 1 32 1Z" />
    </svg>
    <span className="sr-only">{message}</span>
    <span className="buddy-speech-text" aria-hidden="true">
      {reserveMessages.map((text, index) => <span key={index} className="buddy-speech-reserve">{text}</span>)}
      <span className="buddy-speech-live">{text}{!complete && <span className="buddy-speech-caret" />}</span>
    </span>
  </p>;
}
