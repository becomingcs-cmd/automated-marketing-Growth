# GrowthOS

GrowthOS is the control centre for an evidence-led, multi-company marketing and sales operating system. BidNivo is the first pilot workspace.

The product is intentionally in safe mode: it can plan, draft, approve, and audit work, but it cannot publish content, send email, contact leads, or spend money until the relevant connector and approval gate are enabled.

## Current checkpoint

- Responsive control dashboard
- Tenant-aware domain model
- PostgreSQL schema and immutable audit protections
- Role and permission policy
- Content approval state machine
- BidNivo marketing brain seed
- Local demo mode with a production fail-closed guard
- Clerk sign-in, sign-up, and verified user synchronisation foundation
- Health endpoint for infrastructure checks
- Unit tests for tenant isolation and approval policy

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open <http://127.0.0.1:3000>. For the database, run the SQL files in `database/migrations` against PostgreSQL in filename order.

## Clerk authentication

GrowthOS uses Clerk for pilot authentication. Connect Clerk through Vercel or create a Clerk application, then populate the Clerk variables shown in `.env.example`. Configure a Clerk webhook pointing to `/api/webhooks/clerk` and subscribe to `user.created`, `user.updated`, and `user.deleted`.

The webhook verifies Clerk signatures and records delivery IDs before synchronising identity data, making retries idempotent. A signed-in user without a workspace is directed to onboarding.

## Safety rules

1. `SAFE_MODE=true` is the default.
2. `DEMO_MODE=true` is rejected when `NODE_ENV=production`.
3. Every tenant-owned query must include `workspace_id`.
4. Approval and audit events are append-only.
5. AI providers receive only the minimum data required for a task.
6. No production deployment or external connector is authorised by this repository alone.

See `docs/architecture.md`, `docs/security.md`, and `docs/roadmap.md`.
