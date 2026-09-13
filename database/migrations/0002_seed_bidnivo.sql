BEGIN;

INSERT INTO workspaces (id, slug, name, legal_name, safe_mode)
VALUES (
  '10000000-0000-4000-8000-000000000001',
  'bidnivo',
  'BidNivo',
  'BidNivo (Pty) Ltd',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (id, email, display_name, email_verified_at)
VALUES (
  '20000000-0000-4000-8000-000000000001',
  'founder@bidnivo.local',
  'Fumani Khosa',
  now()
) ON CONFLICT DO NOTHING;

INSERT INTO memberships (workspace_id, user_id, role)
VALUES (
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'owner'
) ON CONFLICT DO NOTHING;

INSERT INTO brand_profiles (
  workspace_id, tagline, belief, non_compromise, positioning, tone,
  target_audiences, approved_claims, prohibited_claims, created_by
) VALUES (
  '10000000-0000-4000-8000-000000000001',
  'Evidence-led bid intelligence',
  'Tendering should reward capability - not whoever is best at surviving paperwork.',
  'We do not believe businesses should bid blind.',
  'BidNivo helps businesses understand opportunities, eligibility, requirements, and risk before committing to a bid.',
  '["clear", "credible", "practical", "empowering", "evidence-led"]'::jsonb,
  '["South African SMEs", "tendering teams", "business owners", "bid consultants"]'::jsonb,
  '["Surfaces requirements and risks", "Supports evidence-led bid decisions", "Keeps analysis traceable to source documents"]'::jsonb,
  '["Guaranteed tender wins", "Guaranteed compliance", "Replacement for professional legal or procurement advice", "Unsupported accuracy claims"]'::jsonb,
  '20000000-0000-4000-8000-000000000001'
) ON CONFLICT (workspace_id, version) DO NOTHING;

COMMIT;

