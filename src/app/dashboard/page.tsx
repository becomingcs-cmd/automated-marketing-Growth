import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  Eye,
  Lightning,
  Sparkle,
  TrendUp,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { requireWorkspaceSession } from "@/lib/auth/require-session";

export const metadata: Metadata = { title: "BidNivo overview" };

const queue = [
  { channel: "LinkedIn", title: "Stop bidding blind: three questions before you commit", type: "Thought leadership", due: "Today, 14:30", initials: "in" },
  { channel: "Facebook", title: "The hidden cost of tender paperwork", type: "Awareness", due: "Tomorrow, 09:00", initials: "f" },
  { channel: "Google", title: "Understand the opportunity before you compete", type: "Google Business", due: "18 Sep, 10:00", initials: "G" },
];

const activity = [
  { icon: CheckCircle, tone: "green", title: "Campaign brief approved", detail: "Evidence Before Optimism · Fumani Khosa", time: "12 min ago" },
  { icon: Sparkle, tone: "violet", title: "Three content drafts created", detail: "Generated from approved brand claims", time: "34 min ago" },
  { icon: Users, tone: "blue", title: "New lead captured", detail: "MMGR Holdings · Website enquiry", time: "1 hr ago" },
];

export default async function DashboardPage() {
  const session = await requireWorkspaceSession();
  const firstName = session.displayName.split(/\s+/)[0];
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Johannesburg",
  }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Africa/Johannesburg",
  }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <main className="dashboard-page">
      <div className="page-heading">
        <div><span className="eyebrow">{dateLabel}</span><h1>{greeting}, {firstName}.</h1><p>Here is what the BidNivo growth engine needs from you.</p></div>
        <Link href="/dashboard/campaigns/new" className="button button-primary"><Lightning weight="fill" />Create campaign</Link>
      </div>

      <section className="attention-banner">
        <div className="attention-icon"><Sparkle weight="fill" /></div>
        <div><span className="eyebrow">Growth recommendation</span><h2>Turn “bid/no-bid clarity” into a five-part education series.</h2><p>Your strongest response comes from explaining eligibility before features. Three channel drafts are ready for review.</p></div>
        <Link href="/dashboard/approvals">Review drafts <ArrowRight /></Link>
      </section>

      <section className="metric-grid" aria-label="Growth metrics">
        <article className="metric-card"><div><span>Qualified leads</span><Users /></div><strong>5</strong><p><b>+25%</b> from last week</p></article>
        <article className="metric-card"><div><span>Content awaiting review</span><Clock /></div><strong>3</strong><p>Oldest draft is 2 hours</p></article>
        <article className="metric-card"><div><span>Campaign reach</span><Eye /></div><strong>—</strong><p>Connect analytics to measure</p></article>
        <article className="metric-card"><div><span>Attributed revenue</span><TrendUp /></div><strong>—</strong><p>Starts after first conversion</p></article>
      </section>

      <div className="content-grid">
        <section className="panel queue-panel">
          <div className="panel-head"><div><span className="eyebrow">Decision queue</span><h2>Content awaiting your review</h2></div><Link href="/dashboard/approvals">View all <ArrowUpRight /></Link></div>
          <div className="queue-list">
            {queue.map((item, index) => (
              <article className="queue-item" key={item.title}>
                <div className={`channel-icon channel-${index}`}>{item.initials}</div>
                <div className="queue-copy"><span>{item.channel} · {item.type}</span><strong>{item.title}</strong><small><CalendarBlank /> {item.due}</small></div>
                <StatusPill tone={index === 0 ? "amber" : "grey"}>{index === 0 ? "Review now" : "Pending"}</StatusPill>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel engine-panel">
          <div className="panel-head"><div><span className="eyebrow">Engine health</span><h2>Controlled and ready</h2></div><span className="health-dot" /></div>
          <div className="engine-score"><div><span>Foundation</span><strong>72%</strong></div><div className="progress"><i /></div></div>
          <dl className="engine-list">
            <div><dt><i className="ok" />Brand brain</dt><dd>Ready</dd></div>
            <div><dt><i className="ok" />Approval policy</dt><dd>Enforced</dd></div>
            <div><dt><i className="ok" />Audit history</dt><dd>Append-only</dd></div>
            <div><dt><i className="wait" />Publishing</dt><dd>Safe mode</dd></div>
            <div><dt><i className="wait" />Analytics</dt><dd>Not connected</dd></div>
          </dl>
          <Link href="/dashboard/settings" className="button button-secondary">View setup checklist <ArrowRight /></Link>
        </aside>
      </div>

      <section className="panel activity-panel">
        <div className="panel-head"><div><span className="eyebrow">Audit trail</span><h2>Recent activity</h2></div><Link href="/dashboard/audit">Full history <ArrowUpRight /></Link></div>
        <div className="activity-list">
          {activity.map(({ icon: Icon, tone, title, detail, time }) => (
            <article key={title}><span className={`activity-icon activity-${tone}`}><Icon weight="fill" /></span><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></article>
          ))}
        </div>
      </section>
    </main>
  );
}
