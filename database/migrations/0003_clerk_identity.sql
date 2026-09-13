BEGIN;

ALTER TABLE users ADD COLUMN deleted_at timestamptz;

CREATE TABLE identity_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

COMMIT;

