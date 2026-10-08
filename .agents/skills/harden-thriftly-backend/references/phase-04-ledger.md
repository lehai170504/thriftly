# Phase 04 — Wallet ledger and escrow invariants

## Objective
Make all available/held/escrow movements exact, auditable, conserved, and retry-safe.

## Prerequisite
Phases 02–03 are `APPROVED`.

## Verify current evidence
- Search balance mutations in `WalletService`, `AuctionService`, `OrderService`, and `AdminProductService`.
- Reproduce suspected buy-now escrow and duplicate refund/capture failures before changing behavior.

## Implement
- Define invariants for available, held, escrow, withdrawal, platform revenue, refund, and conservation.
- Add an immutable balanced journal/ledger (or equally auditable model) with unique business/idempotency references.
- Centralize credit, hold, release, capture, transfer, refund, withdrawal, and admin adjustment commands in one transactional boundary.
- Maintain snapshot balances only as transactionally updated projections and provide reconciliation.
- Enforce exact amounts, non-negative policies, uniqueness, and legal transitions in PostgreSQL where possible.

## Exclude
Do not delete/rewrite real history, cache financial truth, or change authentication.

## Gate
Tests cover deposit, buy-now, auction win/loss, hold/release/capture, cancellation, refund, withdrawal approve/reject, admin adjustment, rollback, duplicate request, and conservation. Search confirms no unauthorized direct balance mutation. Fixture reconciliation has zero unexplained drift. Record legacy migration, recovery, and unresolved finance policies.
