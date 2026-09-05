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

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ preview?: string; days?: string }> }) {
  const [{ preview, days: requestedDays }, access] = await Promise.all([searchParams, getAdminAccess()]);
  const localPreview = process.env.NODE_ENV !== "production" && preview === "1";
  if (!access.allowed && !localPreview) return <AccessGate email={access.user?.email} configured={access.configured} />;

  const days = requestedDays === "30" ? 30 : 7;
  const rangeHref = (range: 7 | 30) => `/admin?days=${range}${localPreview ? "&preview=1" : ""}`;
  const data = await getAdminDashboard(days);
  const completionRate = data.overview.effectiveAttempts
    ? Math.round((data.overview.completed / data.overview.effectiveAttempts) * 100)
    : 0;
  const maxDailyAttempts = Math.max(...data.daily.map((day) => day.attempts), 1);

  const metrics = [
    { label: "有效学习人数", value: data.overview.learningUsers, detail: "至少回答 1 道题", icon: Activity, primary: true },
    { label: "完成文章", value: data.overview.completed, detail: `有效练习提交率 ${completionRate}%`, icon: CheckCircle2, primary: true },
    { label: "有效开始", value: data.overview.effectiveAttempts, detail: "排除仅打开未作答", icon: BookOpen },
    { label: "新注册账号", value: data.overview.registeredAccounts, detail: "正式发布后邮箱注册", icon: UsersRound },
  ];

  return <main className="admin-page">
    <header className="admin-header">
      <div><p>CHITOUEN II</p><strong>运营后台</strong></div>
      <div><span>{access.user?.email ?? "本地预览"}</span><Link href="/"><ArrowLeft />返回产品</Link></div>
    </header>

    <div className="admin-content">
      <section className="admin-title">
        <div><p>正式运营</p><h1>发布后，用户真的开始学习了吗？</h1></div>
        <span>统计起点：2026-09-05 17:00（北京时间）</span>
      </section>

      <section className="admin-metrics" aria-label="核心指标">
        {metrics.map(({ label, value, detail, icon: Icon, primary }) => <article className={primary ? "is-primary" : undefined} key={label}>
          <div><span>{label}</span><Icon /></div><strong>{number.format(value)}</strong><small>{detail}</small>
        </article>)}
      </section>

      <section className="admin-grid">
        <article className="admin-panel admin-trend">
          <header><div><p>学习趋势</p><h2>最近 {days} 天有效练习</h2></div><nav className="admin-range" aria-label="选择统计周期"><Link className={days === 7 ? "active" : ""} href={rangeHref(7)}>7 天</Link><Link className={days === 30 ? "active" : ""} href={rangeHref(30)}>30 天</Link></nav></header>
          <div className="admin-chart-legend"><span><i />有效开始</span><span><i className="completed" />完成文章</span></div>
          <div className="admin-chart" style={{ gridTemplateColumns: `repeat(${data.daily.length}, minmax(26px, 1fr))` }}>
            {data.daily.map((day) => <div className="admin-chart-day" key={day.date}>
              <div className="admin-bar-track" title={`${day.activeUsers} 人有效学习，${day.attempts} 次有效开始，${day.completed} 篇完成`}><i style={{ height: `${day.attempts ? Math.max(6, Math.round((day.attempts / maxDailyAttempts) * 100)) : 0}%` }} /><i className="completed" style={{ height: `${day.completed ? Math.max(6, Math.round((day.completed / maxDailyAttempts) * 100)) : 0}%` }} /></div>
              <strong>{day.attempts}</strong><span>{day.date.slice(5).replace("-", "/")}</span>
            </div>)}
          </div>
          <footer>数字为有效开始次数；悬停可查看学习人数与完成文章数。</footer>
        </article>

        <article className="admin-panel admin-definition">
          <header><div><p>统计口径</p><h2>什么算作一次学习？</h2></div></header>
          <dl><div><dt>有效学习人数</dt><dd>至少回答 1 道题的去重学习身份</dd></div><div><dt>有效开始</dt><dd>至少保存 1 道答案的一篇练习</dd></div><div><dt>完成文章</dt><dd>成功提交整篇文章答案</dd></div></dl>
          <p>仅打开文章、发布前内测以及测试邮箱产生的数据，均不计入这里。</p>
        </article>
      </section>

      <section className="admin-grid admin-grid-lower">
        <article className="admin-panel">
          <header><div><p>内容表现</p><h2>最常练习的文章</h2></div></header>
          <div className="admin-list">
            {data.popular.length ? data.popular.map((item, index) => <div key={`${item.year}-${item.passageNumber}`}>
              <span className="admin-rank">{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{item.year} 年 · Text {item.passageNumber}</strong><small>{item.users} 人有效学习 · {item.attempts} 次有效开始</small></div>
              <span>{item.attempts ? Math.round(item.completed / item.attempts * 100) : 0}% 提交</span>
            </div>) : <p className="admin-empty">还没有练习数据</p>}
          </div>
        </article>

        <article className="admin-panel">
          <header><div><p>新用户</p><h2>最近注册</h2></div></header>
          <div className="admin-list admin-user-list">
            {data.recentUsers.length ? data.recentUsers.map((user) => <div key={user.email}>
              <span className="admin-avatar">{user.email.slice(0, 1).toUpperCase()}</span>
              <div><strong>{user.email}</strong><small>{dateTime.format(user.createdAt)}</small></div>
              <span>{user.attempts} 次有效开始 · {user.completed} 篇完成</span>
            </div>) : <p className="admin-empty">还没有邮箱注册用户</p>}
          </div>
        </article>
      </section>
    </div>
  </main>;
}
