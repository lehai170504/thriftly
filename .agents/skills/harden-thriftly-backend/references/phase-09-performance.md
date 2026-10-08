# Phase 09 — Performance and safe caching

## Objective
Fix measured bottlenecks and cache only data whose staleness cannot violate correctness.

## Prerequisite
Phases 02–08 are `APPROVED`.

## Implement
- Define representative data/workloads and record query counts, p50/p95/p99, throughput, errors, CPU/memory, and connections before editing.
- Use PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` on disposable representative data.
- Fix measured N+1, over-fetching, unbounded lists, pagination/count errors, missing indexes, and pool/HTTP timeout issues.
- Add Redis cache only for approved read models, documenting key version, identity boundary, TTL/max size, invalidation, stampede handling, serialization, outage behavior, and metrics.

## Never cache as ordinary data
Wallet/ledger/payment truth, authorization, CSRF/session truth, one-time tokens, purchase inventory decisions, or winner-defining auction state.

## Gate
Query-count and cache hit/miss/invalidation/isolation/outage tests pass. A reproducible load test shows baseline versus result; index write/storage cost is documented. Correctness works with cache disabled, empty, stale, evicted, or unavailable. Revert changes with no measurable safe improvement.
