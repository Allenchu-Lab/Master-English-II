"use client";

import { Button } from "@/components/ui/button";

import { Modal } from "@heroui/react/modal";
import { Input } from "@heroui/react/input";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, CircleUserRound, LoaderCircle, LogOut, AlertCircle } from "lucide-react";
import { AuthApiError, getAuthUser, isEmailUser, requestEmailOtp, signOut, verifyEmailOtp, type AuthUser } from "@/lib/auth/email-otp";
import { isValidEmail } from "@/lib/auth/email-validation";

type Step = "email" | "code";

export function EmailAuth({ isEnglish, onAuthChange, loginRequest, onCancel, compact = false }: { compact?: boolean; isEnglish: boolean; onAuthChange: () => void; loginRequest?: { href: string }; onCancel?: () => void }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const signedIn = isEmailUser(user);
  const [signInEnabled, setSignInEnabled] = useState(false);
  const [localMail, setLocalMail] = useState(false);

  useEffect(() => {
    getAuthUser().then(({ user: current, signInEnabled: enabled, localMail: local }) => {
      setUser(current);
      setSignInEnabled(enabled);
      setLocalMail(local);
    }).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!loginRequest) return;
    let cancelled = false;
    getAuthUser().then(({ user: current, signInEnabled: enabled, localMail: local }) => {
      if (cancelled) return;
      setUser(current);
      setSignInEnabled(enabled);
      setLocalMail(local);
      if (isEmailUser(current)) window.location.assign(loginRequest.href);
      else setOpen(true);
    }).catch(() => {
      if (!cancelled) {
        setOpen(true);
        setError(isEnglish ? "Unable to check your account. Please try again." : "账户状态读取失败，请重试。");
      }
    });
    return () => { cancelled = true; };
  }, [loginRequest, isEnglish]);

  const requestError = (failure: unknown, verifying = false) => {
    if (!(failure instanceof AuthApiError)) return isEnglish ? "Connection failed. Check your network and try again." : "连接失败，请检查网络后重试。";
    if (!isEnglish) return failure.message;
    if (failure.status === 429) return failure.message.includes("一分钟") ? "Please wait one minute before requesting another code." : failure.message.includes("今日") ? "Daily code limit reached. Please try again tomorrow." : "Too many attempts. Please wait before trying again.";
    if (failure.status >= 500) return "Sign-in is temporarily unavailable. Please try again later.";
    return verifying ? "This code is incorrect or expired. Check it and try again." : "Check your email address and try again.";
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
    setEmailError(null);
    setNotice(null);
    onCancel?.();
  };

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setEmailError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        setEmailError(isEnglish ? "Enter your email address." : "请输入邮箱地址。");
        return;
      }
      if (!isValidEmail(normalizedEmail)) {
        setEmailError(isEnglish ? "Enter a valid email address." : "请输入正确的邮箱地址。");
        return;
      }
      await requestEmailOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setCode("");
      setStep("code");
    } catch (failure) {
      setError(requestError(failure));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (code.trim().length < 6) {
        setError(isEnglish ? "Enter the complete verification code." : "请输入完整的验证码。");
        return;
      }
      const result = await verifyEmailOtp(email, code.trim());
      setUser(result.user);
      onAuthChange();
      if (!result.recordsMigrated) {
        setNotice(isEnglish ? "Signed in. Some guest records could not be synced." : "登录成功，但部分游客记录未能同步。");
        return;
      }
      setOpen(false);
      setStep("email");
      setCode("");
      if (loginRequest) window.location.assign(loginRequest.href);
    } catch (failure) {
      setError(requestError(failure, true));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut();
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

  // The server keeps sign-in closed until explicitly enabled and mail is configured.
  const entryDisabled = !signedIn && !signInEnabled;

  return <>
    <Button variant="secondary" className={compact ? "account-entry is-compact" : "account-entry"} title={signedIn ? user?.email ?? undefined : undefined} onClick={() => setOpen(true)} disabled={entryDisabled} aria-label={isEnglish ? "User account" : "个人账户"}>
      <CircleUserRound /><span className="account-entry-label">{signedIn ? (compact ? user?.email?.split("@")[0] : user?.email) : (isEnglish ? "Sign in" : "登录 / 注册")}</span>
    </Button>
    <Modal.Backdrop isOpen={open} onOpenChange={(value) => { if (!value) close(); }} isDismissable={!loading} isKeyboardDismissDisabled={loading}>
      <Modal.Container size="sm" placement="center">
        <Modal.Dialog className="hui-auth-dialog">
          <Modal.CloseTrigger isDisabled={loading} aria-label={isEnglish ? "Close" : "关闭"}/>
          <Modal.Header>
            <Modal.Icon>{signedIn ? <Check/> : <CircleUserRound/>}</Modal.Icon>
            <Modal.Heading>{signedIn ? (isEnglish ? "Your account" : "学习账户") : step === "email" ? (isEnglish ? "Welcome back" : "欢迎回来") : (isEnglish ? "Check your email" : "输入验证码")}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {signedIn ? <div className="hui-account"><strong>{user?.email}</strong><p>{isEnglish ? "Your answers, scores and reading progress sync across devices." : "答案、成绩与精读解锁状态会跨设备同步。"}</p><p>{isEnglish ? "Highlights and AI analyses stay in this browser." : "划词高亮与 AI 解析保存在当前浏览器。"}</p><Button variant="danger-soft" fullWidth disabled={loading} onClick={handleSignOut}><LogOut/>{isEnglish ? "Sign out" : "退出登录"}</Button></div> : step === "email" ? <form className="hui-auth-form" onSubmit={sendCode} noValidate>
              <p>{localMail ? (isEnglish ? "Local preview: no real email is sent." : "本地预览：不会发送真实邮件。") : (isEnglish ? "Sign in with a one-time code. No password needed." : "使用邮箱验证码登录，无需设置密码。")}</p>
              <label htmlFor="hui-email">{isEnglish ? "Email address" : "邮箱地址"}</label>
              <Input id="hui-email" type="email" value={email} onChange={event => { setEmail(event.target.value); setEmailError(null); setError(null); }} placeholder="you@example.com" autoComplete="email" autoFocus aria-invalid={!!emailError} aria-describedby={emailError ? "hui-email-error" : undefined}/>
              {emailError && <span id="hui-email-error" className="hui-field-error" role="alert">{emailError}</span>}
              <Button type="submit" variant="primary" fullWidth disabled={loading}>{loading && <LoaderCircle className="is-spinning"/>}{loading ? (isEnglish ? "Sending…" : "正在发送……") : (isEnglish ? "Send verification code" : "发送验证码")}</Button>
              {error && <div className="hui-auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div>}
              <small>{isEnglish ? "Your email is only used for sign-in and progress sync." : "邮箱仅用于登录和同步学习进度。"}</small>
            </form> : <form className="hui-auth-form" onSubmit={verifyCode} noValidate>
              <p>{localMail ? (isEnglish ? "Find the test code in .local-db/mail.jsonl." : "测试验证码保存在 .local-db/mail.jsonl。") : email}</p>
              <label htmlFor="hui-code">{isEnglish ? "Verification code" : "验证码"}</label>
              <Input id="hui-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }} placeholder="000000" autoFocus/>
              <Button type="submit" variant="primary" fullWidth disabled={loading || code.length < 6}>{loading && <LoaderCircle className="is-spinning"/>}{loading ? (isEnglish ? "Signing in…" : "正在登录……") : (isEnglish ? "Verify and sign in" : "验证并登录")}</Button>
              {error && <div className="hui-auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div>}
              <Button variant="secondary" onClick={() => { setStep("email"); setError(null); }}><ArrowLeft/>{isEnglish ? "Change email" : "更换邮箱"}</Button>
            </form>}
            {notice && <p role="status">{notice}</p>}
            {signedIn && error && <div className="hui-auth-error" role="alert"><AlertCircle aria-hidden="true"/><span>{error}</span></div>}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </>;
}
