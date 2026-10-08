# Phase 10 — Production operations and launch

## Objective
Create a reproducible, observable, recoverable release process and demonstrate launch readiness without autonomously deploying.

## Prerequisite
Phases 01–09 are `APPROVED` or have explicit human-owned risk exceptions.

## Implement
- Harden multi-stage non-root images; never bake secrets. Define dev orchestration and production contract for TLS/proxy, origins, secrets, persistence, migration ownership, resources, and scaling.
- Add CI gates for backend unit/integration/security/migration tests, frontend lint/build/tests, and available dependency/secret/container scans with immutable artifact identity.
- Add structured redacted logs, correlation IDs, liveness/readiness/startup probes, graceful shutdown, metrics, dashboards, and alerts for HTTP/JVM/DB/Redis session/payment/webhook/ledger/outbox/scheduler health.
- Write deploy, migration, forward-fix/rollback, backup/restore, incident, Redis outage, payment reconciliation, stuck job/outbox, and credential-rotation runbooks.
- Build once and promote the same artifact. Use backward-compatible deployment ordering and explicit go/no-go/rollback thresholds.

## Exclude
Do not deploy, create paid cloud resources, rotate real credentials, or access production data without explicit authorization.

## Gate
Disposable production-like stack builds/scans, migrates fresh and upgrade fixtures, passes smoke tests, survives replica restart, and proves session/job/idempotency behavior. Evidence a backup/restore drill, alert path, and rollback/forward-fix game day. Complete launch checklist with owners and human sign-off; agent never authorizes launch.
