"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter({ english, onBackToTop }: { english: boolean; onBackToTop(): void }) {
  const brand = english ? "ChiTouEN II" : "吃透英语二";
  return <footer className="site-footer">
    <div className="site-footer-brand">
      <Link className="site-footer-wordmark" href={english ? "/?lang=en" : "/"}><Image src="/favicon.svg" width={22} height={22} alt="" /><strong>{brand}</strong></Link>
      <p>{english ? "Read deeply. Keep moving forward." : "读懂每一篇，积累每一步。"}</p>
    </div>
    <span className="site-footer-copyright">© {new Date().getFullYear()} {brand}</span>
    <div className="site-footer-legal">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">沪ICP备2026043148号-1</a>
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=31011202023308" target="_blank" rel="noreferrer">沪公网安备31011202023308号</a>
    </div>
    <Button className="site-footer-top" variant="ghost" onClick={onBackToTop}>{english ? "Back to top" : "返回顶部"}<ArrowUp aria-hidden="true" /></Button>
  </footer>;
}
