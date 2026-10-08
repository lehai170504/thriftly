# Phase 07 — Concurrency and idempotency

## Objective
Keep auctions, inventory, orders, vouchers, wallets, refunds, callbacks, and schedulers correct across simultaneous requests and application replicas.

## Prerequisite
Phases 02–06 are `APPROVED`.

## Implement
- For every contested command, document invariant, transaction boundary, lock/version/atomic SQL, lock order, unique idempotency key, retry rule, and side effects.
- Use targeted pessimistic locking, optimistic versioning, atomic updates, and database constraints according to contention.
- Guarantee one sale/settlement, legal ordered bids, non-negative capacity/balance, voucher limits, and one terminal transition.
- Make schedulers safe across replicas with database claiming/locking or a justified distributed scheduler lock.
- Emit notifications/email/WebSocket/external calls after commit; use a transactional outbox when reliable delivery matters.

## Exclude
Do not rely on `synchronized`, one JVM, sleeps, or Redis locks as substitutes for database invariants. Do not add broad caching.

## Gate
PostgreSQL tests use barriers and independent transactions for simultaneous bid, purchase, callback, refund, voucher, wallet, and scheduler cases. Assert one terminal outcome, conservation, no negatives, bounded retries, safe deadlock/serialization handling, and no side effect after rollback. Repeat critical races and report count/flakiness.
