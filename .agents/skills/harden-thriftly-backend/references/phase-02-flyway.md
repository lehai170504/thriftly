# Phase 02 — Flyway migration baseline

## Objective
Replace Hibernate/startup schema mutation with repeatable forward-only Flyway migrations while preserving data.

## Prerequisite
Phase 01 is `APPROVED`; otherwise stop and report.

## Verify current evidence
- `application.yml` uses `ddl-auto: update`.
- `DatabaseFixRunner`, `DataSeeder`, and `DatabaseSeeder` may mutate schema/data.
- Compare entities with actual PostgreSQL schema evidence; do not blindly trust Hibernate output.

## Implement
- Add Flyway and a reviewed baseline with intentional PostgreSQL types, precision, nullability, defaults, foreign keys, uniqueness, and indexes.
- Use `ddl-auto=validate` for production-like profiles; remove schema mutation from application startup.
- Keep demo/admin users out of production migrations. Only universal deterministic reference data belongs there.
- Document fresh install and existing-database adoption, data preflight, backup, baseline decision, checksum policy, forward-fix, and restore.

## Exclude
Do not execute against a real database, destructively clean data, redesign financial models, or edit an applied migration.

## Gate
- Empty PostgreSQL Testcontainer migrates and boots with validation.
- Representative upgrade path is tested or phase is `BLOCKED`.
- Second migration run is a no-op.
- Full backend verification passes and migration/recovery evidence is recorded.
