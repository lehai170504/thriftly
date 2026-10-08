# ADR 003: Flyway-owned schema lifecycle

- Status: Proposed
- Date: 2026-10-08
- Owners: Engineering/operations review required

## Context

Hibernate `ddl-auto=update` and startup runners can mutate schema at application boot. These mechanisms do not provide a sufficiently reviewable, repeatable, ordered, and recoverable production database lifecycle.

## Decision

Flyway versioned migrations are the only production schema mutation mechanism. Production-like application profiles use Hibernate `ddl-auto=validate`. Migrations are forward-only and immutable after application. Deployment treats migration as a controlled release step with compatibility ordering, preflight, backup, monitoring, and a documented forward-fix/restore path.

Fresh-database and existing-database adoption are both tested against PostgreSQL. Seed/demo users remain environment-scoped; only universal deterministic reference data may enter migrations.

## Consequences

- Schema history and checksum drift are visible and reviewable.
- Every entity change requiring schema work must include a migration and upgrade test.
- Existing databases need careful baseline adoption and data-quality preflight.
- Rollback generally means backward-compatible application rollout, forward-fix, or tested restore—not editing applied SQL.

## Rejected alternatives

- Hibernate update/create in production: non-deterministic operational control and weak review/rollback evidence.
- Startup `JdbcTemplate` repair code: runs at the wrong lifecycle boundary and can race across replicas.
- Manual unversioned SQL: produces configuration drift and cannot be reliably rehearsed.

## Open decisions

- Exact baseline version and checksum approval process.
- Migration execution ownership in the selected deployment platform.
- Production backup/restore RPO/RTO and large-table online migration policy.
