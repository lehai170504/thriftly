# Phase 03 — PayOS and payment hardening

## Objective
Credit money only from a verified, server-created, single-use payment intent owned by the authenticated user.

## Prerequisite
Phases 01–02 are `APPROVED`.

## Verify current evidence
- `WalletController` exposes `/deposit`; `WalletService.deposit` credits request data.
- `PaymentController` creates/fetches provider order codes but must be checked for durable owner/amount/currency binding and callback idempotency.

## Implement
- Remove/isolate direct user credit. Add a durable intent: internal ID, unique provider reference, principal owner, exact amount/currency, state, expiry, timestamps, and sanitized provider audit data.
- Create PayOS links only from server-owned intent data. Treat browser returns as navigation, never proof of payment.
- Verify official provider signature/canonical payload, success status, reference, owner, amount/currency, expiry, and legal transition.
- Enforce idempotency and uniqueness in PostgreSQL; retry must converge after local rollback.

## Exclude
Do not build the general ledger (Phase 04) or call real PayOS in tests.

## Gate
Tests cover direct-credit rejection, foreign/unknown order, invalid signature, replay, mismatch, expiry, concurrent duplicate callback, and rollback/retry using a fake adapter. One provider payment credits at most once and only its owner. Backend verification passes; document schema/API compatibility and rollback.
