export function StatusPill({ tone, children }: { tone: "green" | "amber" | "blue" | "grey"; children: React.ReactNode }) {
  return <span className={`status-pill status-${tone}`}><i />{children}</span>;
}

