# Production Hardening Implementation Status

## Status policy

- `NOT_STARTED`: no accepted implementation work.
- `IN_PROGRESS`: implementation has begun; the branch/worktree may be incomplete.
- `BLOCKED`: a named dependency, decision, or failure prevents safe progress.
- `READY_FOR_REVIEW`: implementation and required automated gates pass; human review remains.
- `APPROVED`: only the user or designated reviewer may set this after reviewing evidence.

Update one row per task. Never mark a phase ready merely because code compiles. Put links/paths or exact commands in Evidence and identify unresolved risk rather than hiding it.

| Phase | Topic | Status | Prerequisite | Evidence | Owner/reviewer | Updated |
|---|---|---|---|---|---|---|
| 01 | Environments/config | READY_FOR_REVIEW | — | Phase 01 Evidence below | Antigravity | 2026-10-08 |
| 02 | Flyway baseline | NOT_STARTED | 01 | — | — | — |
| 03 | PayOS/payment | NOT_STARTED | 01–02 | — | — | — |
| 04 | Ledger/escrow | NOT_STARTED | 02–03 | — | — | — |
| 05 | Redis session/CSRF/CORS | NOT_STARTED | 01–02 | — | — | — |
| 06 | Authorization perimeter | NOT_STARTED | 05 | — | — | — |
| 07 | Concurrency/idempotency | NOT_STARTED | 02–06 | — | — | — |
| 08 | Refactoring | NOT_STARTED | 03–07 | — | — | — |
| 09 | Performance/cache | NOT_STARTED | 02–08 | — | — | — |
| 10 | Production/launch | NOT_STARTED | 01–09 | — | — | — |

## Phase 01 Evidence
Phase: 01 - Environments/config
Scope delivered: Split properties by profile. Added PayosProperties, CloudinaryProperties, JwtProperties, AdminProperties. Removed fallbacks in application.yml. Documented variables in .env.example. Restricted seeders to !prod. Added EnvironmentConfigTests.
Files/contracts/migrations changed: 
- `application.yml`, `application-dev.yml`, `application-prod.yml`, `application-test.yml`
- `.env.example`
- `ThriftAuctionApplication.java`
- `DataSeeder.java`, `DatabaseSeeder.java`, `DatabaseFixRunner.java`
- `CloudinaryConfig.java`, `PayOSConfig.java`, `PaymentController.java`
- New Property classes: `PayosProperties`, `CloudinaryProperties`, `JwtProperties`, `AdminProperties`
Commands actually run and exit results: `.\mvnw.cmd clean test` (success), `verify-backend.ps1` (success)
Tests added and scenarios covered: `EnvironmentConfigTests` (checks if profile test loads and prod fails on missing properties).
Data migration/reconciliation result: N/A
Security checks: Credentials removed from production fallbacks.
Performance evidence: N/A
Rollback/forward-fix: Revert the commits.
Open risks/manual checks: Variables need to be loaded via real `.env` or system environment in production.
Reviewer decision: 

## Evidence template

Use this under the table or link a phase report:

```text
Phase:
Scope delivered:
Files/contracts/migrations changed:
Commands actually run and exit results:
Tests added and scenarios covered:
Data migration/reconciliation result:
Security checks:
Performance evidence (if applicable):
Rollback/forward-fix:
Open risks/manual checks:
Reviewer decision:
```

## Decisions still requiring human confirmation

- Production topology, hosting provider, domain/origin list, TLS termination, and secret manager.
- Session idle/absolute lifetime and concurrent-session policy.
- PayOS/GHN production webhook capabilities and credential/signature rotation process.
- Wallet accounting model, reconciliation owner, refund policy, and admin-adjustment approval process.
- Recovery objectives (RPO/RTO), SLOs, alert ownership, privacy retention, and final launch window.
