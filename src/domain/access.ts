export const roles = [
  "owner",
  "admin",
  "strategist",
  "creator",
  "reviewer",
  "sales",
  "analyst",
] as const;

export type Role = (typeof roles)[number];

export const permissions = [
  "workspace.manage",
  "team.manage",
  "brand.read",
  "brand.write",
  "intelligence.read",
  "intelligence.write",
  "campaign.read",
  "campaign.write",
  "content.read",
  "content.write",
  "content.review",
  "content.publish",
  "lead.read",
  "lead.write",
  "analytics.read",
  "audit.read",
] as const;

export type Permission = (typeof permissions)[number];

const policy: Record<Role, ReadonlySet<Permission>> = {
  owner: new Set(permissions),
  admin: new Set(permissions.filter((permission) => permission !== "workspace.manage")),
  strategist: new Set([
    "brand.read", "intelligence.read", "intelligence.write", "campaign.read",
    "campaign.write", "content.read", "content.write", "analytics.read",
  ]),
  creator: new Set(["brand.read", "intelligence.read", "campaign.read", "content.read", "content.write"]),
  reviewer: new Set(["brand.read", "campaign.read", "content.read", "content.review", "analytics.read"]),
  sales: new Set(["campaign.read", "lead.read", "lead.write", "analytics.read"]),
  analyst: new Set(["brand.read", "intelligence.read", "campaign.read", "content.read", "lead.read", "analytics.read", "audit.read"]),
};

export function can(role: Role, permission: Permission): boolean {
  return policy[role].has(permission);
}

export function requirePermission(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error(`Forbidden: ${role} lacks ${permission}`);
  }
}

