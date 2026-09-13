type PilotOwnerEligibility = {
  accountEmail?: string | null;
  expectedEmail?: string | null;
  verified: boolean;
};

export function canClaimPilotWorkspace({
  accountEmail,
  expectedEmail,
  verified,
}: PilotOwnerEligibility): boolean {
  if (!verified || !accountEmail || !expectedEmail) return false;
  return accountEmail.trim().toLowerCase() === expectedEmail.trim().toLowerCase();
}
