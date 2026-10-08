# ADR 002: Immutable wallet ledger and escrow commands

- Status: Proposed
- Date: 2026-10-08
- Owners: Product/finance/engineering review required

## Context

Wallet balance and held-balance mutations currently occur across wallet, auction, order, and admin services. Duplicate/refund paths and concurrent callbacks make snapshot-only balances difficult to audit, reconcile, and safely retry.

## Decision

Represent financial events in an immutable journal with unique business/idempotency references and balanced entries. Expose named transactional commands—credit verified deposit, hold, release, capture, transfer, refund, request/approve/reject withdrawal, and audited admin adjustment. Only the ledger boundary may update wallet projections.

PostgreSQL remains the financial source of truth. Balance projections may be maintained in the same database transaction for read performance, then reconciled against journal entries. Redis must not be the authority for balance, ledger, escrow, or settlement decisions.

## Consequences

- Financial history becomes auditable and retry-safe; reconciliation can detect drift.
- Schema and data migration are more involved and require a freeze/snapshot/reconciliation plan.
- All existing direct mutations must move behind the command boundary.
- Refund, fee, rounding, currency, negative balance, and admin-adjustment policies must become explicit product decisions.

## Rejected alternatives

- Continue mutable balances plus descriptive transaction rows: does not reliably prove conservation or prevent drift.
- Redis atomic counters as wallet authority: persistence/recovery and cross-entity transaction guarantees are unsuitable.
- Distributed microservice ledger immediately: adds operational complexity before domain invariants are stabilized.

## Open decisions

- Single-currency VND minor-unit representation versus future multi-currency support.
- Chart of accounts, platform fee treatment, withdrawal clearing, and reconciliation ownership.
- Migration and handling of unexplained legacy differences.
