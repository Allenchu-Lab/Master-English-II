"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, Check, LoaderCircle, LogOut, X } from "lucide-react";
import { isEmailUser, requestEmailOtp, signOut, verifyEmailOtp } from "@/lib/auth/email-otp";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export function EmailAuth({ isEnglish, onAuthChange }: { isEnglish: boolean; onAuthChange: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const signedIn = isEmailUser(user);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    client.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const close = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
    setEmailError(null);
    setNotice(null);
  };

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) { setError(isEnglish ? "The login service is not configured." : "登录服务尚未配置。"); return; }
    setLoading(true);
    setError(null);
    setEmailError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        setEmailError(isEnglish ? "Enter your email address." : "请输入邮箱地址。");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setEmailError(isEnglish ? "Enter a valid email address." : "请输入正确的邮箱地址。");
        return;
      }
      await requestEmailOtp(client, normalizedEmail);
      setEmail(normalizedEmail);
      setCode("");
      setStep("code");
    } catch {
      setError(isEnglish ? "Unable to send the code. Please try again later." : "验证码发送失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      if (code.trim().length < 6) {
        setError(isEnglish ? "Enter the complete verification code." : "请输入完整的验证码。");
        return;
      }
      const result = await verifyEmailOtp(client, email, code.trim());
      setUser(result.user);
      onAuthChange();
      if (!result.recordsMigrated) {
        setNotice(isEnglish ? "Signed in. Some guest records could not be synced." : "登录成功，但部分游客记录未能同步。");
        return;
      }
      setOpen(false);
      setStep("email");
      setCode("");
    } catch {
      setError(isEnglish ? "The code is incorrect or has expired." : "验证码错误或已过期，请重新输入。");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      await signOut(client);
      setUser(null);
      setOpen(false);
      setEmail("");
      setCode("");
      setStep("email");
      onAuthChange();
    } catch {
      setError(isEnglish ? "Unable to sign out. Please try again." : "退出失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return <>
    <button className="account-button" onClick={() => setOpen(true)} aria-label={isEnglish ? "User account" : "个人账户"}>
      <Image src="/default-student-avatar.png" alt="" width={28} height={28} />
      <div><strong>{signedIn ? user?.email : (isEnglish ? "Sign in" : "登录 / 注册")}</strong><small>{signedIn ? (isEnglish ? "Email account" : "邮箱账户") : (isEnglish ? "Continue your progress" : "同步学习进度")}</small></div>
    </button>

    {open && <div className="auth-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" onClick={close} aria-label={isEnglish ? "Close" : "关闭"}><X /></button>
        <div className="auth-scene" aria-hidden="true">
          <div className="auth-scene-brand"><Image src="/favicon.svg" alt="" width={28} height={28} /><span>MASTER ENGLISH II</span></div>
          <svg viewBox="0 0 360 74" focusable="false"><path d="M8 56 C70 56 58 18 118 18 S174 60 226 52 S284 16 352 20" /><circle cx="8" cy="56" r="3" /><circle cx="118" cy="18" r="3" /><circle cx="226" cy="52" r="3" /><circle cx="352" cy="20" r="3" /><circle className="auth-route-dot" r="4" /></svg>
          <strong>{isEnglish ? "Keep every step of your progress." : "让每一步学习，都有迹可循。"}</strong>
        </div>

        <div className="auth-dialog-body">
        {signedIn ? <div className="auth-account-view" key="account">
          <span className="auth-status-mark"><Check /></span>
          <h2 id="auth-title">{isEnglish ? "Signed in" : "已登录"}</h2>
          <p>{user?.email}</p>
          <small>{isEnglish ? "Your practice and intensive-reading progress is synced to this account." : "做题记录与精读进度已同步至此账户。"}</small>
          <button className="auth-secondary-action" onClick={handleSignOut} disabled={loading}>{loading ? <LoaderCircle className="is-spinning" /> : <LogOut />}{isEnglish ? "Sign out" : "退出登录"}</button>
          {error && <p className="auth-error">{error}</p>}
        </div> : step === "email" ? <form onSubmit={sendCode} key="email" noValidate>
          <h2 id="auth-title">{isEnglish ? "Sign in with email" : "邮箱验证码登录"}</h2>
          <p>{isEnglish ? "No password needed. We will send a one-time code to your email." : "无需设置密码，我们会向你的邮箱发送一次性验证码。"}</p>
          <label><input className={emailError ? "has-error" : ""} type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(null); }} placeholder={isEnglish ? "Enter your email address" : "请输入邮箱地址"} aria-label={isEnglish ? "Email" : "邮箱"} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "auth-email-error" : undefined} autoComplete="email" autoFocus />{emailError && <span className="auth-field-error" id="auth-email-error">{emailError}</span>}</label>
          <button className="auth-primary-action" disabled={loading}>{loading ? <LoaderCircle className="is-spinning" /> : null}{isEnglish ? "Send code" : "发送验证码"}</button>
          <small className="auth-privacy">{isEnglish ? "Your email is used only for login and progress sync." : "邮箱仅用于登录和同步学习进度。"}</small>
          {error && <p className="auth-error">{error}</p>}
        </form> : <form onSubmit={verifyCode} key="code" noValidate>
          <button type="button" className="auth-back" onClick={() => { setStep("email"); setError(null); }}><ArrowLeft />{isEnglish ? "Change email" : "更换邮箱"}</button>
          <h2 id="auth-title">{isEnglish ? "Enter verification code" : "输入邮箱验证码"}</h2>
          <p>{isEnglish ? <>A verification code was sent to <strong>{email}</strong></> : <>验证码已发送至 <strong>{email}</strong></>}</p>
          <label><span>{isEnglish ? "Verification code" : "验证码"}</span><input className="auth-code-input" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="000000" autoFocus /></label>
          <button className="auth-primary-action" disabled={loading || code.length < 6}>{loading ? <LoaderCircle className="is-spinning" /> : null}{isEnglish ? "Verify and sign in" : "验证并登录"}</button>
          {notice && <p className="auth-notice">{notice}</p>}
          {error && <p className="auth-error">{error}</p>}
        </form>}
        </div>
      </section>
    </div>}
  </>;
}
