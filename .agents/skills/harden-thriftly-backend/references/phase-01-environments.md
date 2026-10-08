# Phase 01 — Environment and configuration baseline

## Objective
Make common, dev, test, and prod behavior explicit. Production must fail fast when required configuration is absent.

## Verify current evidence
- `backend/src/main/resources/application.yml` contains shared settings, `ddl-auto: update`, and fallback credentials/secrets.
- `core/config/DatabaseFixRunner.java`, `DataSeeder.java`, and `DatabaseSeeder.java` may run at startup.
- Inventory PayOS, GHN, Cloudinary, AI, mail, database, cookie/security, WebSocket, Swagger, and observability configuration before editing.

## Implement
- Split profile-specific settings and bind important settings through validated `@ConfigurationProperties`.
- Remove production-capable fallback secrets; document sanitized variables without printing or rotating real values.
- Restrict seed/demo data, schema repair, verbose SQL/errors, Swagger, and developer utilities to safe profiles.
- Make tests deterministic and prevent real external calls. Define production health/readiness exposure and proxy/TLS assumptions.

## Exclude
Do not implement Flyway, Redis sessions, payment changes, containers, or deployment.

## Gate
- Test profile context loads.
- Missing required production configuration fails clearly.
- Secret scan is reported with values redacted.
- Backend verification and `git diff --check` pass.
- Document variable matrix, rollout, rollback, and unresolved deployment decisions.
