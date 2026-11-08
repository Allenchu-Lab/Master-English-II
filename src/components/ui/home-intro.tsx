"use client";

import Image from "next/image";
import { type ReactNode, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BuddySpeech } from "@/components/ui/buddy-speech";
import { runtimeTokens } from "@/styles/runtime-tokens";

gsap.registerPlugin(useGSAP);

const copies = [
  { zh: ["读懂真题，把题做对。", "一次练一篇，读懂再继续。", "今天也陪你，读懂一篇真题。"], en: ["Read it. Solve it.", "One passage at a time.", "One passage at a time. I’m with you."] },
  { zh: ["每一篇，都有新收获。", "多懂一个句子，多一点把握。", "不用着急，我们慢慢来。"], en: ["Make each passage count.", "Understand a little more with each attempt.", "Take your time. We’ll work through it."] },
  { zh: ["慢一点，读得更明白。", "找到原文依据，再做出选择。", "再读一遍，也许就懂了。"], en: ["Slow down. See more.", "Find the evidence before choosing.", "Another read might make it click."] },
  { zh: ["把不懂的，一点点弄懂。", "从一个词、一个句子开始。", "有我陪你，一点点来。"], en: ["Make room to understand.", "Start with one word, then one sentence.", "Let’s take it one step at a time."] },
  { zh: ["练过的题，变成你的底气。", "回看一次，理解就再深一点。", "这次的收获，记得带走。"], en: ["Build confidence as you go.", "Review an attempt. Deepen your understanding.", "Keep what you learned today."] },
  { zh: ["今天也向前一步。", "选一篇真题，开始今天的练习。", "准备好了吗？一起开始吧。"], en: ["One step closer.", "Pick a passage and begin today’s practice.", "Ready when you are. Let’s begin."] },
];

export function HomeIntro({ english, children }: { english: boolean; children?: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [speechIndex, setSpeechIndex] = useState(0);
  const activeIndex = useRef(0);
  const initialized = useRef(false);
  const root = useRef<HTMLElement>(null);

  useGSAP((_context, contextSafe) => {
    const header = root.current;
    if (!header || !contextSafe) return;
    const slides = Array.from(header.querySelectorAll<HTMLElement>(".home-copy-slide"));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const storageKey = "chitou-home-copy-next";
    let current = activeIndex.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let animation: gsap.core.Timeline | undefined;
    let disposed = false;
    let hovered = header.matches(":hover");
    let focused = header.contains(document.activeElement);
    let onScreen = true;
    const styles = getComputedStyle(header);
    const enterY = styles.getPropertyValue("--home-copy-enter-y").trim();
    const exitY = styles.getPropertyValue("--home-copy-exit-y").trim();
    const fields = (slide: HTMLElement) => slide.querySelectorAll("h1, p");
    const canRotate = () => !disposed && !preference.matches && !document.hidden && !hovered && !focused && onScreen;
    const remember = () => { try { sessionStorage.setItem(storageKey, String((current + 1) % copies.length)); } catch {} };
    const schedule = () => {
      clearTimeout(timer);
      if (canRotate()) timer = setTimeout(advance, runtimeTokens.buddy.copyIntervalMs);
    };
    const advance = contextSafe(() => {
      if (!canRotate()) return;
      const outgoing = slides[current];
      current = (current + 1) % copies.length;
      activeIndex.current = current;
      const incoming = slides[current];
      // Layers remain mounted in one grid cell, so wrapping never shifts the CTA/cards.
      animation = gsap.timeline({ onComplete: () => {
        if (disposed) return;
        setSpeechIndex(current);
        remember();
        schedule();
      } });
      animation.to(fields(outgoing), { autoAlpha: 0, y: exitY, duration: runtimeTokens.homeCopy.exitSeconds,
        stagger: runtimeTokens.homeCopy.staggerSeconds, ease: runtimeTokens.motion.ease.response })
        .set(outgoing, { autoAlpha: 0 })
        .call(() => { if (!disposed) setIndex(current); })
        .set(incoming, { autoAlpha: 1 })
        .fromTo(fields(incoming), { autoAlpha: 0, y: enterY }, { autoAlpha: 1, y: 0,
          duration: runtimeTokens.homeCopy.enterSeconds, stagger: runtimeTokens.homeCopy.staggerSeconds,
          ease: runtimeTokens.motion.ease.response });
    });
    const sync = () => {
      clearTimeout(timer);
      // Finish an interrupted transition in a readable state; resume with a full dwell.
      if (!canRotate() && animation?.isActive()) animation.progress(1);
      schedule();
    };
    const enter = () => { hovered = true; sync(); };
    const leave = () => { hovered = false; sync(); };
    const focusIn = (event: FocusEvent) => {
      focused = event.target instanceof Element && header.contains(event.target);
      sync();
    };
    const focusOut = (event: FocusEvent) => {
      focused = event.relatedTarget instanceof Element && header.contains(event.relatedTarget);
      sync();
    };
    const frame = requestAnimationFrame(contextSafe(() => {
      if (disposed) return;
      try {
        const stored = initialized.current ? String(current) : sessionStorage.getItem(storageKey);
        const saved = stored === null ? 0 : Number(stored);
        if (Number.isInteger(saved) && saved >= 0 && saved < copies.length) current = saved;
      } catch {}
      initialized.current = true; activeIndex.current = current;
      setIndex(current); setSpeechIndex(current);
      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(slides[current], { autoAlpha: 1 });
      remember(); schedule();
    }));
    header.addEventListener("pointerenter", enter);
    header.addEventListener("pointerleave", leave);
    header.addEventListener("focusin", focusIn);
    header.addEventListener("focusout", focusOut);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); });
    observer.observe(header);
    return () => {
      disposed = true; clearTimeout(timer); cancelAnimationFrame(frame); observer.disconnect();
      header.removeEventListener("pointerenter", enter);
      header.removeEventListener("pointerleave", leave);
      header.removeEventListener("focusin", focusIn);
      header.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
    };
  }, { scope: root, dependencies: [english], revertOnUpdate: true });

  const language = english ? "en" : "zh";
  return <header ref={root} className={`learning-intro ${english ? "is-english" : ""}`}>
    <div className="home-intro-main">
      <div className="home-intro-copy" aria-live="off">
        {copies.map((copy, position) => <div className="home-copy-slide" key={position}
          data-active={position === index} aria-hidden={position !== index} inert={position !== index}>
          <h1>{copy[language][0]}</h1><p>{copy[language][1]}</p>
        </div>)}
      </div>
      {children}
    </div>
    <div className="home-buddy-conversation">
      <BuddySpeech message={copies[speechIndex][language][2]} reserveMessages={copies.map(copy => copy[language][2])} />
      <div className="home-buddy-mascot"><Image className="home-study-buddy" src="/images/study-buddy-kitten-v2.webp" alt={english ? "Your study buddy, a kitten holding a book" : "抱着书的小猫考研搭子"} width={768} height={768} loading="eager" /></div>
    </div>
  </header>;
}
