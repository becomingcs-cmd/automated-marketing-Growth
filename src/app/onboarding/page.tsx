import { currentUser } from "@clerk/nextjs/server";
import { BuildingOffice, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { isClerkConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!isClerkConfigured()) redirect("/sign-in");
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <BrandMark />
        <span className="section-icon"><BuildingOffice weight="fill" /></span>
        <span className="eyebrow">Welcome, {user.firstName ?? "there"}</span>
        <h1>Connect your GrowthOS workspace.</h1>
        <p>Your identity is verified. Workspace creation and invitation acceptance are the next implementation step.</p>
        <div className="form-lock"><ShieldCheck weight="fill" /><span>No company data is created without an explicit workspace decision.</span></div>
      </section>
    </main>
  );
}

