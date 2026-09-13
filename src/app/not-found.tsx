import Link from "next/link";

export default function NotFound() {
  return (
    <main className="center-page">
      <div className="empty-state">
        <span className="eyebrow">404</span>
        <h1>That page is not part of GrowthOS.</h1>
        <p>Return to the BidNivo control centre.</p>
        <Link className="button button-primary" href="/dashboard">Open dashboard</Link>
      </div>
    </main>
  );
}

