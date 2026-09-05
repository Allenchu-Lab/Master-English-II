import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowLeft, BookOpen, CheckCircle2, CircleUserRound, UsersRound } from "lucide-react";
import { AdminLogin } from "@/components/admin-login";
import { getAdminDashboard } from "@/data/get-admin-dashboard";
import { getAdminAccess } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "运营后台 · ChiTouEN II",
  robots: { index: false, follow: false },
};

const number = new Intl.NumberFormat("zh-CN");
const dateTime = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

function AccessGate({ email, configured }: { email?: string | null; configured: boolean }) {
  return <main className="admin-gate">
    <section>
      <div className="admin-mark"><CircleUserRound /></div>
      <p className="admin-eyebrow">CHITOUEN II · ADMIN</p>
      <h1>{email ? "当前账号没有后台权限" : "登录后查看运营后台"}</h1>
      <p>{email
        ? `当前登录账号：${email}`
        : "后台仅对管理员开放，请使用管理员邮箱完成验证码登录。"}</p>
      {!configured && <p className="admin-config-note">管理员邮箱尚未配置，请先设置 ADMIN_EMAILS。</p>}
      <div className="admin-gate-actions"><Link href="/"><ArrowLeft />返回产品</Link><AdminLogin /></div>
    </section>
  </main>;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const [{ preview }, access] = await Promise.all([searchParams, getAdminAccess()]);
  const localPreview = process.env.NODE_ENV !== "production" && preview === "1";
  if (!access.allowed && !localPreview) return <AccessGate email={access.user?.email} configured={access.configured} />;

  const data = await getAdminDashboard();
  const completionRate = data.overview.attempts
    ? Math.round((data.overview.completed / data.overview.attempts) * 100)
    : 0;
  const maxDailyAttempts = Math.max(...data.daily.map((day) => day.attempts), 1);

  const metrics = [
    { label: "注册用户", value: data.overview.registeredUsers, detail: `近 7 天新增 ${data.overview.newUsers7d}`, icon: UsersRound },
    { label: "今日做题用户", value: data.overview.activeToday, detail: `近 7 天 ${data.overview.active7d} 人`, icon: Activity },
    { label: "开始练习", value: data.overview.attempts, detail: "累计练习次数", icon: BookOpen },
    { label: "完成练习", value: data.overview.completed, detail: `提交率 ${completionRate}%`, icon: CheckCircle2 },
  ];

  return <main className="admin-page">
    <header className="admin-header">
      <div><p>CHITOUEN II</p><strong>运营后台</strong></div>
      <div><span>{access.user?.email ?? "本地预览"}</span><Link href="/"><ArrowLeft />返回产品</Link></div>
    </header>

    <div className="admin-content">
      <section className="admin-title">
        <div><p>数据概览</p><h1>产品现在有人用吗？</h1></div>
        <span>实时读取数据库 · 刷新页面更新</span>
      </section>

      <section className="admin-metrics" aria-label="核心指标">
        {metrics.map(({ label, value, detail, icon: Icon }) => <article key={label}>
          <div><span>{label}</span><Icon /></div><strong>{number.format(value)}</strong><small>{detail}</small>
        </article>)}
      </section>

      <section className="admin-grid">
        <article className="admin-panel admin-trend">
          <header><div><p>使用趋势</p><h2>最近 7 天练习量</h2></div><span><i />开始练习</span></header>
          <div className="admin-chart">
            {data.daily.map((day) => <div className="admin-chart-day" key={day.date}>
              <div className="admin-bar-track" title={`${day.attempts} 次练习，${day.activeUsers} 位用户`}><i style={{ height: `${Math.max(6, Math.round((day.attempts / maxDailyAttempts) * 100))}%` }} /></div>
              <strong>{day.attempts}</strong><span>{day.date.slice(5).replace("-", "/")}</span>
            </div>)}
          </div>
          <footer>近 7 天共有 <strong>{number.format(data.overview.active7d)}</strong> 位做题用户</footer>
        </article>

        <article className="admin-panel admin-audience">
          <header><div><p>用户构成</p><h2>登录与匿名用户</h2></div></header>
          <div className="admin-audience-total">{number.format(data.overview.registeredUsers + data.overview.anonymousUsers)}<small>累计创建用户</small></div>
          <div className="admin-audience-row"><span><i className="registered" />邮箱用户</span><strong>{number.format(data.overview.registeredUsers)}</strong></div>
          <div className="admin-audience-row"><span><i />匿名用户</span><strong>{number.format(data.overview.anonymousUsers)}</strong></div>
          <p>匿名用户是浏览器生成的学习身份，不代表已知的真实用户。</p>
        </article>
      </section>

      <section className="admin-grid admin-grid-lower">
        <article className="admin-panel">
          <header><div><p>内容表现</p><h2>最常练习的文章</h2></div></header>
          <div className="admin-list">
            {data.popular.length ? data.popular.map((item, index) => <div key={`${item.year}-${item.passageNumber}`}>
              <span className="admin-rank">{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{item.year} 年 · Text {item.passageNumber}</strong><small>{item.users} 位用户</small></div>
              <span>{item.completed} / {item.attempts} 完成</span>
            </div>) : <p className="admin-empty">还没有练习数据</p>}
          </div>
        </article>

        <article className="admin-panel">
          <header><div><p>新用户</p><h2>最近注册</h2></div></header>
          <div className="admin-list admin-user-list">
            {data.recentUsers.length ? data.recentUsers.map((user) => <div key={user.email}>
              <span className="admin-avatar">{user.email.slice(0, 1).toUpperCase()}</span>
              <div><strong>{user.email}</strong><small>{dateTime.format(user.createdAt)}</small></div>
              <span>{user.completed} 篇完成</span>
            </div>) : <p className="admin-empty">还没有邮箱注册用户</p>}
          </div>
        </article>
      </section>
    </div>
  </main>;
}
