import { ArrowLeft, LockKey, Wrench } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspaceSession } from "@/lib/auth/require-session";

const sections: Record<string, { title: string; description: string }> = {
  intelligence: { title: "Market intelligence", description: "Evidence, customer questions, market changes, and traceable source material." },
  campaigns: { title: "Campaigns", description: "Create measurable briefs that connect content to leads, sales, and revenue." },
  approvals: { title: "Approval queue", description: "Review exact content versions before anything can be scheduled or published." },
  leads: { title: "Leads & CRM", description: "Qualify prospects, record consent, manage follow-up, and track sales outcomes." },
  analytics: { title: "Analytics", description: "Measure reach, qualified leads, demos, customers, revenue, and operating cost." },
  settings: { title: "Workspace settings", description: "Control BidNivo’s brand, team, integrations, safety, and budgets." },
  audit: { title: "Audit history", description: "An append-only record of decisions, changes, and external actions." },
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: sections[section]?.title ?? "Not found" };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  await requireWorkspaceSession();
  const { section } = await params;
  const item = sections[section];
  if (!item) notFound();
  return (
    <main className="dashboard-page section-page">
      <Link href="/dashboard" className="back-link"><ArrowLeft /> Back to overview</Link>
      <div className="section-hero"><span className="section-icon"><Wrench weight="fill" /></span><span className="eyebrow">Checkpoint 2 foundation</span><h1>{item.title}</h1><p>{item.description}</p></div>
      <div className="panel section-notice"><LockKey weight="fill" /><div><h2>The policy and database layer are ready.</h2><p>This operational screen will be connected in the next checkpoint. External actions remain blocked while safe mode is on.</p></div></div>
    </main>
  );
}
