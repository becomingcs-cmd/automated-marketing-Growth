import { SignUp } from "@clerk/nextjs";
import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { BrandMark } from "@/components/brand-mark";
import { isClerkConfigured } from "@/lib/env";

export default function SignUpPage() {
  if (isClerkConfigured()) {
    return <main className="clerk-page"><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" /></main>;
  }
  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandMark />
        <span className="auth-icon"><LockKey weight="fill" /></span>
        <span className="eyebrow">Registration locked</span>
        <h1>Clerk setup is not complete.</h1>
        <p>No account can register until the approved authentication keys are connected.</p>
      </section>
    </main>
  );
}

