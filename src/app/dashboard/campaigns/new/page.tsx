import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { requireWorkspaceSession } from "@/lib/auth/require-session";

export default async function NewCampaignPage() {
  await requireWorkspaceSession();
  return (
    <main className="dashboard-page section-page">
      <Link href="/dashboard" className="back-link"><ArrowLeft /> Back to overview</Link>
      <div className="page-heading"><div><span className="eyebrow">Campaign builder</span><h1>Create a measurable campaign.</h1><p>Every campaign begins with an audience, a business outcome, and an evidence-backed message.</p></div></div>
      <form className="panel campaign-form">
        <label><span>Campaign name</span><input name="name" placeholder="e.g. Evidence Before Optimism" disabled /></label>
        <div className="form-row"><label><span>Primary audience</span><input name="audience" placeholder="South African SMEs pursuing tenders" disabled /></label><label><span>Primary outcome</span><select name="metric" disabled><option>Qualified leads</option></select></label></div>
        <label><span>Core problem</span><textarea name="problem" placeholder="What tolerated compromise are we challenging?" rows={4} disabled /></label>
        <div className="form-lock"><ShieldCheck weight="fill" /><span>Campaign persistence is enabled after PostgreSQL and final authentication are connected.</span></div>
        <button className="button button-primary" disabled>Save campaign brief</button>
      </form>
    </main>
  );
}
