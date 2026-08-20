import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "吃透英语二",
  description: "把每一篇考研英语二真题真正读懂、做对、记住。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("ui-language")==="en"){document.title="ChiTouEN II";document.documentElement.lang="en"}}catch{}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
