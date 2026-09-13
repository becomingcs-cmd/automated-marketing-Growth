BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE membership_role AS ENUM (
  'owner', 'admin', 'strategist', 'creator', 'reviewer', 'sales', 'analyst'
);
CREATE TYPE data_class AS ENUM ('public', 'internal', 'confidential', 'highly_confidential');
CREATE TYPE campaign_status AS ENUM ('draft', 'planned', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE content_status AS ENUM ('draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'rejected');
CREATE TYPE approval_decision AS ENUM ('submitted', 'approved', 'changes_requested', 'rejected');
CREATE TYPE lead_status AS ENUM ('new', 'qualified', 'nurturing', 'demo_booked', 'won', 'lost', 'suppressed');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text NOT NULL,
  external_auth_id text,
  email_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);
CREATE UNIQUE INDEX users_email_unique ON users (lower(email));
CREATE UNIQUE INDEX users_external_auth_id_unique ON users (external_auth_id) WHERE external_auth_id IS NOT NULL;

CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  legal_name text,
  safe_mode boolean NOT NULL DEFAULT true,
  timezone text NOT NULL DEFAULT 'Africa/Johannesburg',
  currency char(3) NOT NULL DEFAULT 'ZAR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  tagline text,
  belief text NOT NULL,
  non_compromise text NOT NULL,
  positioning text NOT NULL,
  tone jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_audiences jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_claims jsonb NOT NULL DEFAULT '[]'::jsonb,
  prohibited_claims jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, version)
);

CREATE TABLE intelligence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL,
  source_url text,
  source_label text,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_class data_class NOT NULL DEFAULT 'internal',
  observed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  objective text NOT NULL,
  audience text NOT NULL,
  primary_metric text NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  starts_on date,
  ends_on date,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  channel text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  scheduled_for timestamptz,
  published_at timestamptz,
  external_id text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, id),
  CONSTRAINT published_requires_external_id CHECK (status <> 'published' OR external_id IS NOT NULL)
);

CREATE TABLE approval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  content_item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  content_version integer NOT NULL,
  decision approval_decision NOT NULL,
  comment text,
  decided_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  email text,
  phone text,
  company_name text,
  contact_name text,
  source text NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  score smallint CHECK (score BETWEEN 0 AND 100),
  consent_basis text,
  consent_recorded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_contact_method CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE RESTRICT,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  request_id text,
  ip_hash text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX memberships_user_idx ON memberships (user_id);
CREATE INDEX campaigns_workspace_status_idx ON campaigns (workspace_id, status);
CREATE INDEX content_workspace_status_idx ON content_items (workspace_id, status);
CREATE INDEX approvals_content_idx ON approval_events (workspace_id, content_item_id, created_at DESC);
CREATE INDEX leads_workspace_status_idx ON leads (workspace_id, status);
CREATE INDEX audit_workspace_created_idx ON audit_events (workspace_id, created_at DESC);
CREATE INDEX intelligence_workspace_observed_idx ON intelligence_items (workspace_id, observed_at DESC);

CREATE FUNCTION prevent_append_only_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$;

CREATE TRIGGER approval_events_no_update
BEFORE UPDATE OR DELETE ON approval_events
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_mutation();

CREATE TRIGGER audit_events_no_update
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_mutation();

ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION current_workspace_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.workspace_id', true), '')::uuid
$$;

CREATE POLICY tenant_brand_profiles ON brand_profiles
  USING (workspace_id = current_workspace_id()) WITH CHECK (workspace_id = current_workspace_id());
CREATE POLICY tenant_intelligence_items ON intelligence_items
  USING (workspace_id = current_workspace_id()) WITH CHECK (workspace_id = current_workspace_id());
CREATE POLICY tenant_campaigns ON campaigns
  USING (workspace_id = current_workspace_id()) WITH CHECK (workspace_id = current_workspace_id());
CREATE POLICY tenant_content_items ON content_items
  USING (workspace_id = current_workspace_id()) WITH CHECK (workspace_id = current_workspace_id());
CREATE POLICY tenant_approval_events ON approval_events
  USING (workspace_id = current_workspace_id()) WITH CHECK (workspace_id = current_workspace_id());
CREATE POLICY tenant_leads ON leads
  USING (workspace_id = current_workspace_id()) WITH CHECK (workspace_id = current_workspace_id());
CREATE POLICY tenant_audit_events ON audit_events
  USING (workspace_id = current_workspace_id()) WITH CHECK (workspace_id = current_workspace_id());

COMMIT;

