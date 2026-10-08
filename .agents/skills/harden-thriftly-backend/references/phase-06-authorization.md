# Phase 06 — Authorization and security perimeter

## Objective
Enforce least privilege and ownership across REST, admin operations, WebSocket/STOMP, webhooks, and uploads.

## Prerequisite
Phase 05 is `APPROVED`.

## Implement
- Inventory every route/destination and create a matrix for anonymous, authenticated, owner, seller, moderator, admin, and system/webhook actors. Default deny.
- Derive identity from the authenticated session. Enforce resource ownership and critical roles inside application services plus boundary rules.
- Authenticate WebSocket sessions and authorize each SEND/SUBSCRIBE destination.
- Verify webhook authenticity/replay protection according to provider capability; if signing is unavailable, document explicit compensating controls and reconciliation.
- Validate upload authorization, byte/content signature, type, size/count, object key, and safe errors.
- Standardize 401/403 and emit redacted security audit events.

## Exclude
Do not redesign ledger, performance, or deployment. Rate limiting never replaces authorization.

## Gate
Parameterized positive/negative route tests, user-A/user-B object tests, seller/admin boundary tests, forbidden WebSocket tests, invalid/replayed webhook tests, illegal state-transition tests, and spoofed/oversized upload tests pass. Every route/destination appears in the matrix; remaining provider/manual assumptions are recorded.
