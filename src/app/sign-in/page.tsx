import { LockKey } from "@phosphor-icons/react/dist/ssr";
import { BrandMark } from "@/components/brand-mark";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandMark />
        <span className="auth-icon"><LockKey weight="fill" /></span>
        <span className="eyebrow">Protected control centre</span>
        <h1>Sign-in connection pending.</h1>
        <p>The production authentication provider has not been selected. Local preview access remains available only outside production.</p>
        <div className="auth-note">No public account can access GrowthOS until verified authentication is connected.</div>
      </section>
    </main>
  );
}

