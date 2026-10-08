# Production Launch Checklist

This checklist is a release gate. Mark items only with attached evidence. “Works locally” is not launch evidence.

## Governance and release

- [ ] Phases 01–10 are `APPROVED`, or exceptions have named owner, expiry, and explicit risk acceptance.
- [ ] Release version, immutable artifact digest, changelog, approvers, window, and rollback decision-maker are recorded.
- [ ] API/frontend compatibility and database deployment order are documented.
- [ ] No critical/high security or data-integrity finding remains unresolved.
- [ ] License/dependency policy and software bill of materials are reviewed.

## Secrets and configuration

- [ ] No production secret exists in Git, image layers, frontend bundles, logs, examples, or default values.
- [ ] Required configuration fails fast and is supplied through the approved secret/config service.
- [ ] Key rotation and emergency revocation are rehearsed for session, PayOS, GHN, mail, Cloudinary, AI, database, and Redis credentials.
- [ ] Trusted origins, hosts, proxy headers, TLS, and cookie domain/path are exact for production.
- [ ] Debug endpoints, Swagger policy, seeders, SQL logging, and verbose errors are production-safe.

## Identity and security

- [ ] Redis-backed sessions have fixation protection, idle/absolute expiry, logout, revoke-all, and outage behavior tested.
- [ ] Auth cookies are `HttpOnly`, `Secure`, deliberately `SameSite`, narrowly scoped, and never exposed to JavaScript.
- [ ] CSRF is enforced for all unsafe cookie-authenticated requests; CORS uses an explicit allowlist.
- [ ] REST and WebSocket authorization matrix is reviewed with negative object-ownership tests.
- [ ] Webhooks, uploads, rate limits, validation, audit logs, and security headers pass tests.
- [ ] Automated dependency, secret, SAST, and container scans meet the agreed threshold.

## Database and financial integrity

- [ ] Flyway succeeds on a fresh database and a production-like upgrade copy; Hibernate validates only.
- [ ] Pre-migration backup and tested restore are within RPO/RTO.
- [ ] Money uses exact units; database constraints protect uniqueness and non-negative/transition invariants.
- [ ] Payment callbacks are signed/verified, owner/amount/currency bound, replay-safe, and reconciled.
- [ ] Ledger conservation and wallet snapshot reconciliation produce zero unexplained difference.
- [ ] Concurrent bids, purchases, voucher claims, callbacks, refunds, and scheduler execution pass repeatable tests.

## Reliability and performance

- [ ] Timeouts, connection pools, retry budgets, circuit behavior, request/body limits, and graceful shutdown are configured.
- [ ] Load test meets agreed p95/p99, throughput, and error targets on production-like data.
- [ ] Redis cache keys/TTL/invalidation/isolation are reviewed; correctness survives cache loss or stale data.
- [ ] Multi-instance scheduler and outbox processing are duplicate-safe.
- [ ] Capacity and scaling limits for app, PostgreSQL, Redis, storage, and external quotas are documented.

## Observability and operations

- [ ] Structured logs include correlation IDs and redact credentials, tokens, sensitive payloads, and personal data.
- [ ] Dashboards cover HTTP/JVM, DB pool/slow queries, Redis/session, payments, ledger reconciliation, webhooks, outbox, and schedulers.
- [ ] Liveness, readiness, startup probes, alerts, paging routes, and ownership are tested.
- [ ] Runbooks cover deploy, migration, rollback/forward-fix, restore, session/Redis outage, payment reconciliation, stuck jobs, and incident response.
- [ ] Privacy retention, deletion/export handling, audit retention, and access to operational data are approved.

## Staging rehearsal and go/no-go

- [ ] The same artifact intended for production passed migration and smoke tests in production-like staging.
- [ ] Restart, partial dependency outage, failed migration, rollback/forward-fix, and backup/restore drills are evidenced.
- [ ] Post-deploy synthetic checks and payment/order/ledger reconciliation queries are prepared.
- [ ] Monitoring window, success thresholds, rollback triggers, and communication channels are assigned.
- [ ] Product owner, engineering, security, and operations have recorded go/no-go decisions.

## Post-launch

- [ ] Smoke checks and critical business metrics are healthy.
- [ ] Payment, order, inventory, wallet, and ledger reconciliation has no unexplained discrepancy.
- [ ] Error rate, latency, saturation, queue/outbox lag, DB/Redis health, and security events remain within thresholds.
- [ ] Launch notes, incidents, rollback decisions, and follow-up work are recorded.
