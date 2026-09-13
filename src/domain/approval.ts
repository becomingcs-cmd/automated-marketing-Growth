export type ContentStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

const transitions: Record<ContentStatus, readonly ContentStatus[]> = {
  draft: ["in_review"],
  in_review: ["approved", "changes_requested", "rejected"],
  changes_requested: ["in_review"],
  approved: ["scheduled"],
  scheduled: ["published"],
  published: [],
  rejected: ["draft"],
};

export function transitionContent(from: ContentStatus, to: ContentStatus): ContentStatus {
  if (!transitions[from].includes(to)) {
    throw new Error(`Invalid content transition: ${from} -> ${to}`);
  }
  return to;
}

export function assertPublishable(input: {
  status: ContentStatus;
  safeMode: boolean;
  connectorEnabled: boolean;
  idempotencyKey?: string;
}): void {
  if (input.safeMode) throw new Error("Publishing blocked: workspace is in safe mode");
  if (!input.connectorEnabled) throw new Error("Publishing blocked: connector is disabled");
  if (input.status !== "scheduled") throw new Error("Publishing blocked: content is not scheduled");
  if (!input.idempotencyKey?.trim()) throw new Error("Publishing blocked: idempotency key is required");
}

