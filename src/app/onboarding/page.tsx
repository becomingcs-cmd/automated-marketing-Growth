import { currentUser } from "@clerk/nextjs/server";
import { BuildingOffice, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { claimBidNivoWorkspace } from "@/app/onboarding/actions";
import { BrandMark } from "@/components/brand-mark";
import { canClaimPilotWorkspace } from "@/domain/bootstrap";
import { findWorkspaceForExternalUser } from "@/lib/db/auth-repository";
import { isClerkConfigured, readEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!isClerkConfigured()) redirect("/sign-in");
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  if (await findWorkspaceForExternalUser(user.id)) redirect("/dashboard");

  const primaryEmail = user.primaryEmailAddress;
  const email = primaryEmail?.emailAddress.toLowerCase();
  const expectedOwnerEmail = readEnv().BOOTSTRAP_OWNER_EMAIL;
  const canClaimBidNivo = canClaimPilotWorkspace({
    accountEmail: email,
    expectedEmail: expectedOwnerEmail,
    verified: primaryEmail?.verification?.status === "verified",
  });

  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <BrandMark />
        <span className="section-icon"><BuildingOffice weight="fill" /></span>
        <span className="eyebrow">Welcome, {user.firstName ?? "there"}</span>
        <h1>Connect your GrowthOS workspace.</h1>
        <p>Your identity is verified. Connect the authorised founder account to the existing BidNivo workspace.</p>
        <div className="form-lock"><ShieldCheck weight="fill" /><span>Owner access is restricted to the explicitly configured, verified email address.</span></div>
        {canClaimBidNivo ? (
          <form action={claimBidNivoWorkspace} className="onboarding-actions">
            <button type="submit" className="button button-primary">Claim BidNivo workspace</button>
          </form>
        ) : (
          <p className="onboarding-help">This account is not on the owner allowlist. Set <code>BOOTSTRAP_OWNER_EMAIL</code> to this account&apos;s verified email before continuing.</p>
        )}
      </section>
    </main>
  );
}
