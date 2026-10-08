# 10 Antigravity prompts for Thriftly production hardening

Run these prompts in order. Use a fresh Antigravity task/chat for each phase, review the diff and evidence, then mark the phase `APPROVED` yourself before continuing. Do not paste multiple prompts into one task.

## Prompt 1 — Environment and configuration baseline

```text
Use the `harden-thriftly-backend` skill and execute Phase 01 only: Environment and configuration baseline.

Read .agents/AGENTS.md, backend/AGENTS.md, docs/production/IMPLEMENTATION_STATUS.md, and the Phase 01 reference selected by the skill. Inspect the current repository and git status before editing; verify every baseline claim against current code.

Implement a safe configuration split for common/dev/test/prod, typed validated configuration for required settings, fail-fast production startup, and non-production scoping for Swagger, seed/demo data, verbose SQL/errors, DatabaseFixRunner/DataSeeder/DatabaseSeeder, and other developer utilities. Remove production-capable fallback secrets, but never print, rotate, or invent real credentials. Add sanitized configuration documentation or .env.example. Keep ddl-auto migration work, Redis sessions, payments, Docker, and deployment out of this phase.

Add tests proving the test profile loads and unsafe production configuration cannot silently start. Run targeted tests, the skill's backend verification, and git diff --check. Do not commit, push, deploy, or touch a real database. Update only the Phase 01 row to READY_FOR_REVIEW if all required gates genuinely pass; never mark APPROVED. Report files/contracts changed, exact commands and results, remaining risks, manual checks, and rollback steps, then stop.
```

## Prompt 2 — Flyway migration baseline

```text
Use the `harden-thriftly-backend` skill and execute Phase 02 only: Flyway migration baseline.

First confirm Phase 01 is APPROVED in docs/production/IMPLEMENTATION_STATUS.md. If not, stop after reporting the unmet prerequisite; do not implement Phase 02. Read the repository/backend rules and Phase 02 reference, inspect the actual PostgreSQL-oriented entities, indexes, constraints, startup runners, and current schema assumptions.

Introduce Flyway as the only schema lifecycle mechanism. Create a reviewed initial migration/baseline, move only universal deterministic reference data where appropriate, eliminate startup schema mutation, and set production-like Hibernate behavior to validate. Document safe adoption for both a fresh database and an existing database, including preflight, backup, baseline decision, and forward-fix/restore; never execute against a real/prod database or delete data. Do not redesign wallet/payment/auth in this phase.

Add PostgreSQL/Testcontainers integration coverage showing all migrations succeed on an empty database, schema validation passes, and a second run is a no-op. Add representative upgrade-path evidence if feasible; otherwise mark the phase BLOCKED rather than pretending. Run targeted tests, full backend verification, and git diff --check. Update Phase 02 to READY_FOR_REVIEW only with real evidence; never APPROVED. Report changed migrations, schema risks, commands/results, rollout and recovery steps, then stop.
```

## Prompt 3 — PayOS and payment hardening

```text
Use the `harden-thriftly-backend` skill and execute Phase 03 only: PayOS and payment hardening.

Require Phases 01 and 02 to be APPROVED or stop with a prerequisite report. Read the applicable rules/reference, inspect PaymentController, WalletController, WalletService, PayOSConfig, transaction entities/repositories, security configuration, and current frontend payment calls. Reproduce the unsafe paths with tests before changing them.

Prevent normal users from directly crediting a wallet. Add a durable server-created payment intent binding authenticated owner, exact amount/currency, unique provider order/reference, expiry, state, and audit metadata. Create provider links from server-owned data. Treat the browser return URL as display/navigation only; credit only after verified server-to-server confirmation. Validate the provider-required signature/canonical payload, success state, owner/reference, amount, currency, expiry, and legal transition. Make duplicate and concurrent callbacks idempotent using database enforcement. Use a fake PayOS adapter in tests and make zero real payment calls. Keep the general double-entry ledger redesign for Phase 04.

Test manual-credit rejection, foreign order code, invalid signature, replay, amount/currency mismatch, expiry, unknown reference, concurrent duplicate callbacks, and rollback/retry. Run all relevant security/integration tests and backend verification. Update only Phase 03 to READY_FOR_REVIEW if gates pass; never APPROVED. Report API/schema changes, evidence, threat cases covered, remaining provider/manual verification, rollout compatibility, and rollback, then stop.
```

## Prompt 4 — Wallet ledger and escrow invariants

```text
Use the `harden-thriftly-backend` skill and execute Phase 04 only: Wallet ledger and escrow invariants.

Require Phases 02 and 03 to be APPROVED. Read the rules/reference and inspect every balance or held-balance mutation in WalletService, AuctionService, OrderService, AdminProductService, schedulers, entities, and repositories. Write explicit conservation, hold, capture, release, transfer, refund, withdrawal, fee, and admin-adjustment invariants before editing. Reproduce the suspected buy-now/escrow and duplicate-refund failures with tests.

Introduce an immutable, database-backed journal/ledger with unique business/idempotency references and balanced entries, or document an equivalently auditable model. Centralize all financial mutation in named transactional commands and remove direct mutations outside that boundary. Maintain wallet snapshots only transactionally as projections and provide reconciliation. Add exact-amount, non-negative, uniqueness, and transition constraints where appropriate. Do not rewrite/delete real historical data or use Redis as financial truth; produce a legacy-data migration and reconciliation plan.

Add unit and PostgreSQL integration tests for deposit credit, hold/release/capture, buy-now, auction win/loss, cancellation, refund, withdrawal approve/reject, admin adjustment, rollback, duplicate request, and conservation. Search for remaining unauthorized setBalance/setHeldBalance calls. Run backend verification. Set Phase 04 READY_FOR_REVIEW only if tests and reconciliation fixtures pass; never APPROVED. Report invariants, schema/API changes, reconciliation result, unresolved product decisions, rollout and recovery, then stop.
```

## Prompt 5 — Redis session, secure cookies, CSRF, and CORS

```text
Use the `harden-thriftly-backend` skill and execute Phase 05 only: Redis-backed browser sessions, cookies, CSRF, and CORS.

Require Phases 01 and 02 to be APPROVED. Read repo/backend/frontend rules and the Phase 05 reference. Inspect AuthController/AuthService, JWT filter/service, refresh tokens, SecurityConfig, CsrfCookieFilter, frontend auth store/API client, token storage, and all CORS/CSRF matchers. Document the migration path before editing.

Implement Spring Session Redis for browser authentication with explicit namespace, safe serialization, idle timeout, absolute-lifetime strategy, fixation protection, rotation after authentication/privilege change, logout/revoke behavior, and defined Redis-outage behavior. Send only an opaque HttpOnly session cookie; configure Secure/SameSite/path/domain by environment. Stop returning or persisting access/refresh tokens in browser-readable state. Restore users through the authenticated profile endpoint. Enforce CSRF for every unsafe cookie-authenticated request and wire the documented cookie/header convention in the frontend. Allow credentialed CORS only for exact environment-specific trusted origins. Keep general application caching and unrelated authorization refactors out of scope.

Test login, fixation, two-instance session access, expiry, logout, revoke/disable/password change, safe/unsafe CSRF cases, allowed/disallowed CORS/preflight, cookie attributes, frontend 401/403/CSRF behavior, and no token persistence. Run backend tests plus frontend lint/build/tests. Set Phase 05 READY_FOR_REVIEW only with actual results; never APPROVED. Report contract changes, migration/rollback window, Redis operational risks, commands/results, and manual browser checks, then stop.
```

## Prompt 6 — Authorization and security perimeter

```text
Use the `harden-thriftly-backend` skill and execute Phase 06 only: Authorization and security perimeter.

Require Phase 05 to be APPROVED. Read the rules/reference and inventory every REST endpoint, admin action, resource ownership rule, WebSocket CONNECT/SEND/SUBSCRIBE destination, webhook, and media upload. Create an authorization matrix before implementation and default to deny. Verify identity always comes from the authenticated session rather than a client user ID.

Enforce role and object ownership at the service/use-case layer, with route/method security as defense in depth. Standardize safe 401/403 handling. Authenticate WebSocket sessions and authorize destinations so users cannot read/send another user's private traffic. Verify GHN/other webhook authenticity and replay protection according to provider capabilities; if signing is unavailable, implement/document explicit compensating controls and reconciliation. Harden upload authorization, size/count, real content signature/type, object naming, and error handling. Add security audit events without logging secrets or sensitive payloads. Do not redesign ledger, performance, or deployment.

Add parameterized positive/negative authorization tests, user-A-versus-user-B ownership tests, seller/admin boundaries, forbidden WebSocket subscriptions/sends, webhook replay/invalid credential/status-transition tests, and spoofed/oversized upload tests. Run complete security/backend verification. Update Phase 06 to READY_FOR_REVIEW only if the matrix is covered; never APPROVED. Report uncovered/manual policies, provider assumptions, commands/results, and rollback, then stop.
```

## Prompt 7 — Concurrency and idempotency

```text
Use the `harden-thriftly-backend` skill and execute Phase 07 only: Concurrency and idempotency.

Require Phases 02 through 06 to be APPROVED. Read the rules/reference and enumerate contested commands for bids, auction deposit/close, buy-now inventory, payment callbacks, wallet commands, refunds, withdrawals, voucher claims, order transitions, and schedulers. For each, document the invariant, transaction boundary, database lock/version/atomic-update strategy, lock order, unique/idempotency key, retry rule, and side effects.

Implement database-enforced correctness using targeted pessimistic locks, optimistic versions, atomic SQL, and unique constraints according to contention—not a blanket approach. Ensure one product sells once, bids remain legal/ordered, voucher/inventory/balance never oversubscribe, callbacks/refunds settle once, and terminal transitions cannot conflict. Make scheduled jobs safe across multiple application instances. Move notifications/email/WebSocket/external effects after commit; use a transactional outbox where reliable delivery matters. Do not rely on synchronized, one JVM, timing sleeps, or Redis locks as a replacement for database invariants.

Add repeatable PostgreSQL concurrency tests with barriers and separate transactions for each critical race; assert one terminal result, ledger conservation, no negative values, retry bounds, and no side effect from rollback. Run critical races repeatedly and report count/flakiness. Run backend verification. Set Phase 07 READY_FOR_REVIEW only with deterministic evidence; never APPROVED. Report the concurrency matrix, lock ordering, results, residual deadlock/operational risks, rollout and rollback, then stop.
```

## Prompt 8 — Architecture refactoring and reuse

```text
Use the `harden-thriftly-backend` skill and execute Phase 08 only: Architecture refactoring and code reuse.

Require Phases 03 through 07 to be APPROVED so behavior is protected by tests. Read the rules/reference, map feature dependencies, and identify the highest-value bounded slice—especially oversized OrderService logic, duplicated auction-deposit/refund policies, direct cross-feature entity mutation, repository calls in mapping, or misplaced transactions. Present the selected slice and measurable goals before editing; do not start a big-bang rewrite.

Add characterization tests first. Refactor one slice into thin controllers, explicit application use cases with transaction boundaries, pure domain policies, repositories/adapters, deterministic mappers, and after-commit events as appropriate. Reuse abstractions only when semantics truly match; avoid generic base controller/service/repository/DTO layers and do not split into microservices. Preserve API schemas, status codes, authorization, financial invariants, and event timing unless a contract change is explicitly approved. Add ArchUnit/module tests for useful dependency rules.

Run focused regression tests after each slice, compare API/OpenAPI behavior where possible, then run full backend verification. Do not mix dependency upgrades, new features, caching, or behavior cleanup into this phase. Set Phase 08 READY_FOR_REVIEW only if complexity/duplication is demonstrably reduced and behavior remains covered; never APPROVED. Report before/after structure and metrics, contracts, commands/results, remaining debt, and rollback, then stop.
```

## Prompt 9 — Performance and safe caching

```text
Use the `harden-thriftly-backend` skill and execute Phase 09 only: Performance and safe caching.

Require Phases 02 through 08 to be APPROVED. Read the rules/reference. Before editing, define representative production-like data/workloads and capture baseline query counts, p50/p95/p99 latency, throughput, errors, CPU/memory, and DB connection behavior for hot product/category/search/admin endpoints. Use PostgreSQL EXPLAIN (ANALYZE, BUFFERS) on disposable representative data; do not guess.

Fix measured N+1 queries, over-fetching, unbounded lists, pagination/count issues, missing/selectivity-poor indexes, and pool/HTTP timeout limits. Use projections/entity graphs/joins deliberately. Add Redis cache only for approved non-critical read models with explicit key version and user/tenant boundary, TTL, max size, invalidation, stampede protection, serialization compatibility, outage behavior, and metrics. Never cache wallet/ledger/payment truth, authorization, CSRF/session truth, one-time tokens, inventory purchase decisions, or winner-defining auction state. Correctness must survive disabled, empty, stale, or unavailable cache.

Add query-count integration tests, cache hit/miss/invalidation/isolation/outage tests, and a reproducible load test comparing baseline to result. Document index write/storage cost. Run backend verification and present measured before/after evidence; if no measurable safe improvement, revert the optimization. Set Phase 09 READY_FOR_REVIEW only with evidence; never APPROVED. Report cache register, plans/metrics, commands/results, capacity risks, and rollback, then stop.
```

## Prompt 10 — Production operations and launch readiness

```text
Use the `harden-thriftly-backend` skill and execute Phase 10 only: Production operations and launch readiness.

Require Phases 01 through 09 to be APPROVED or stop and list unmet gates. Read the rules/reference and docs/production/LAUNCH_CHECKLIST.md. Do not deploy, buy/create cloud resources, rotate real credentials, or access a production database. Work only on reproducible artifacts, CI, production-like local/staging evidence, observability, recovery, and runbooks.

Create hardened multi-stage non-root container builds and development/production-like orchestration for app, PostgreSQL, and Redis without baking secrets into images. Define the real deployment contract for TLS/proxy, trusted origins, persistence, scaling, resource limits, secret injection, and migration ownership. Add CI gates for backend unit/integration/security/migration tests, frontend lint/build/tests, dependency/secret/container scans, and artifact identity. Add structured redacted logs, correlation IDs, separate liveness/readiness/startup health, metrics/dashboards/alerts for HTTP/JVM/DB/Redis sessions/payment/webhooks/ledger/outbox/schedulers, and graceful shutdown. Write deploy, migration, rollback/forward-fix, backup/restore, incident, Redis outage, stuck job/outbox, payment reconciliation, and credential-rotation runbooks.

Build/scan and run the production-like stack on disposable data; migrate fresh and upgrade fixtures, smoke test, restart replicas, verify sessions/jobs/idempotency, perform a disposable backup/restore drill, and exercise rollback/forward-fix plus alert paths. Complete the launch checklist with evidence, owners, RPO/RTO/SLO decisions, exceptions, and human sign-offs. Set Phase 10 only to READY_FOR_REVIEW; never APPROVED and never self-authorize launch. Report exact artifacts, commands/results, drill evidence, blockers, go/no-go inputs, and final manual actions, then stop.
```
