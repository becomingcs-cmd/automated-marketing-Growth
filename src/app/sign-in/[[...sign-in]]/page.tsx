import { SignIn } from "@clerk/nextjs";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { BrandMark } from "@/components/brand-mark";
import { isClerkConfigured } from "@/lib/env";

export default function SignInPage() {
  if (isClerkConfigured()) {
    return <main className="clerk-page"><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" /></main>;
  }
  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandMark />
        <span className="auth-icon"><LockKey weight="fill" /></span>
        <span className="eyebrow">Clerk selected</span>
        <h1>Authentication keys are required.</h1>
        <p>The code is ready. Connect the Clerk integration and add its publishable and secret keys to activate secure sign-in.</p>
        <div className="auth-note">GrowthOS remains closed to public access until those keys are configured.</div>
      </section>
    </main>
  );
}

