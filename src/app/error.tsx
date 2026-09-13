"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="center-page">
      <div className="empty-state">
        <span className="eyebrow">Something went wrong</span>
        <h1>GrowthOS could not load this view.</h1>
        <p>No external action was taken. You can safely try again.</p>
        <button className="button button-primary" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}

