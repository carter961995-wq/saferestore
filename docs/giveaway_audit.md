# Giveaway Audit

## Scope and stack reality
Requested stack references (wouter, Express/TS, Drizzle/Postgres) are not present in this repo.
Actual stack in this repo:
- Frontend: React + Vite + react-router-dom
- Backend: Express (JavaScript)
- Persistence: file-backed JSON store (no Drizzle/Postgres in repo)

This audit and implementation were applied to the real codebase in place with minimal rewrites.

## What existed before
- No dedicated public giveaway route or claim flow.
- No race-safe key assignment logic.
- No tier inventory/status API.
- No admin giveaway upload/export management.
- No honeypot, disposable email filtering, or per-IP claim window checks.

## What now exists
- Public route/UI: `/giveaway`
  - Shows live per-tier inventory
  - Polls `/api/giveaway/status` every 30s and on window focus
  - Claim form requires `tier` + `email` and has hidden honeypot input
  - Handles sold-out/already-claimed/rate-limit errors
  - Shows key once with copy button and save warning
- Claim endpoint: `POST /api/giveaway/claim`
  - Body: `{ tier, email, hp? }`
  - Response: `{ tier, licenseKey, remainingCounts }`
- Status endpoint: `GET /api/giveaway/status`
  - Response includes totals/claimed/remaining by tier + `updatedAt`
- Admin endpoints (token-protected):
  - `POST /api/admin/giveaway/upload` body `{ tier, keys: string[] }`
  - `GET /api/admin/giveaway/export-claims` (CSV)
  - `GET /api/admin/giveaway/keys?tier=...`
  - `GET /api/admin/giveaway/snapshot` (counts + last 20 claims)
- Admin UI route: `/admin/giveaway`
  - Upload keys by tier
  - View counts + last claims
  - Export CSV
  - Browse key state per tier

## Data model in this repo
Stored in `server/data/giveaway-store.json` as table-like arrays:
- `giveaway_license_keys`:
  - `id, tier, licenseKey, isClaimed, claimedAt, claimedEmail, claimedIp, claimedUserAgent, createdAt`
- `giveaway_claims`:
  - `id, tier, email, ip, userAgent, createdAt, licenseKeyId`

## Inventory and atomicity
- Remaining counts are computed from claimed keys grouped by tier.
- Tier totals come from single shared server config file: `server/giveawayConfig.js`.
- Claim assignment is race-safe in this runtime model via serialized critical section + atomic file write/rename.
- This prevents double-issuing the same key within this app process.

## Abuse controls
- Honeypot rejection (`hp` must be empty)
- Email format validation
- Disposable email denylist
- One claim per email per tier
- Max 3 claims per IP in rolling 24h
- Endpoint rate limiter on claim route

## Security notes
- Admin endpoints require `ADMIN_TOKEN` via `Authorization: Bearer <token>` or `?token=`.
- Structured claim attempt logs added, without full key logging (only key id/last 4).

## Gaps / risks that remain
1. File-based storage is not ideal for multi-instance deployments.
2. No external transactional DB locking (because DB stack is absent in this repo).
3. Existing legacy RBAC routes (`x-sr-role` header based) are still weak and should be redesigned separately.
4. Automated backend tests for giveaway rules still need to be added in this repo.

## Minimal-change next step plan
1. Add backend test suite for claim rules + concurrency behavior.
2. Move giveaway storage to Postgres when DB layer is introduced in this repo.
3. Replace header-trust RBAC with server-authenticated sessions/tokens.
