# Security and privacy baseline

## Tenant isolation

Every tenant-owned table contains `workspace_id`. Database row-level security uses a transaction-local `app.workspace_id` value, while application repositories require an explicit workspace context. A missing workspace must fail closed.

## Roles

- `owner`: workspace control and final approval
- `admin`: configuration and team management
- `strategist`: intelligence and campaign planning
- `creator`: draft creation and revision
- `reviewer`: content review and approval
- `sales`: lead and pipeline operations
- `analyst`: read-only analytics

Permissions are capabilities, not UI labels. Server-side policy is authoritative.

## Data classes

- `public`: approved for public distribution
- `internal`: routine operational data
- `confidential`: customer, lead, or commercial data
- `highly_confidential`: secrets, credentials, banking, or regulated records

AI tasks must declare the maximum data class accepted by the selected provider. Highly confidential data is never sent to a general-purpose cloud model.

## External actions

Publishing, email, messaging, calls, ad spend, and connector changes are external actions. Each action requires:

1. An enabled connector
2. An approved action type
3. A valid content or campaign approval
4. An idempotency key
5. A durable audit event
6. Safe mode to be disabled by an owner

## Authentication

Clerk is the approved pilot identity provider. GrowthOS uses Clerk for identity verification and session management while PostgreSQL remains authoritative for workspace membership and application roles. Clerk webhooks are signature-verified and idempotent. Demo access throws during production startup.

Production activation still requires Clerk keys, a signed webhook secret, and final dashboard settings for email verification and MFA.

The protected dashboard layout is forced to render dynamically so authentication is evaluated on every request. Every protected page also performs its own fail-closed session check before rendering because layouts and pages can render in parallel. Protected HTML must never be emitted as a static build artifact or a streamed redirect body.
