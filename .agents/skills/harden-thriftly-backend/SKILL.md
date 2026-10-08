---
name: harden-thriftly-backend
description: Run one evidence-driven production-hardening phase for the Thriftly Spring Boot backend. Use for environment profiles, Flyway, PayOS and wallet security, ledger and escrow, Redis-backed sessions, secure cookies, CSRF and CORS, authorization and WebSocket security, transaction concurrency, backend refactoring, query performance and caching, observability, containers, CI/CD, or launch readiness.
---

# Harden Thriftly Backend

Execute exactly one production-hardening phase per invocation. Make changes only when the user asked for implementation; for audit or planning requests, remain read-only.

## Start here

1. Read `.agents/AGENTS.md` and `backend/AGENTS.md` completely.
2. Read `docs/production/IMPLEMENTATION_STATUS.md` and inspect `git status`.
3. Map the request to one phase below and read only that phase reference.
4. Inspect the referenced source files. Treat paths and findings in references as leads, not unquestionable facts.
5. Present a concise plan containing scope, exclusions, risks, tests, and rollback before editing.

## Phase routing

| Phase | Topic | Reference |
|---|---|---|
| 01 | Environment and configuration baseline | `references/phase-01-environments.md` |
| 02 | Flyway migration baseline | `references/phase-02-flyway.md` |
| 03 | PayOS and payment hardening | `references/phase-03-payment.md` |
| 04 | Wallet ledger and escrow invariants | `references/phase-04-ledger.md` |
| 05 | Redis session, cookies, CSRF, CORS | `references/phase-05-session-csrf.md` |
| 06 | Authorization and security perimeter | `references/phase-06-authorization.md` |
| 07 | Concurrency and idempotency | `references/phase-07-concurrency.md` |
| 08 | Architecture and refactoring | `references/phase-08-refactoring.md` |
| 09 | Performance and safe caching | `references/phase-09-performance.md` |
| 10 | Production operations and launch | `references/phase-10-production.md` |

If a request spans phases, complete the earliest unmet prerequisite only and report the remaining phases. Do not declare a later phase production-ready while a required earlier gate is unapproved.

## Execute the phase

- Preserve public API behavior unless the phase explicitly changes a contract; document every contract change.
- Prefer incremental migrations and compatibility windows over flag-day changes.
- Keep controllers thin, transactions in application services, persistence in repositories, and mapping free of I/O.
- Protect money operations with server-derived amounts, ownership checks, idempotency, auditable ledger entries, and database-enforced invariants.
- Use PostgreSQL-compatible tests for locking, constraints, and migration behavior.
- Never cache wallet balances, auction winners, authorization decisions, session truth, or other correctness-critical mutable state.
- Do not run destructive database commands, real payment callbacks, production deployment, commit, push, or merge.

## Verify and report

Run targeted tests followed by the relevant gate. For a full backend gate, use:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/harden-thriftly-backend/scripts/verify-backend.ps1
```

For a read-only risk scan, use:

```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/harden-thriftly-backend/scripts/scan-production-risks.ps1
```

Update `docs/production/IMPLEMENTATION_STATUS.md` with evidence only when implementation was requested and checks actually ran. An agent may set `IN_PROGRESS`, `BLOCKED`, or `READY_FOR_REVIEW`; never self-approve.

Finish with:

1. Phase and outcome.
2. Files and contracts changed.
3. Tests and commands with results.
4. Security, data, and rollback considerations.
5. Remaining risks and manual checks.
6. Recommended next phase, without starting it.
