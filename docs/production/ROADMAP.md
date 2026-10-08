# Thriftly Production Hardening Roadmap

## Purpose

This roadmap converts the current Spring Boot application into a production-ready system through small, reviewable phases. It is a control document, not proof that any phase is complete. Phase evidence belongs in `IMPLEMENTATION_STATUS.md`.

## Baseline observed on 2026-10-08

- Backend: Java 17, Spring Boot 3.3.0, PostgreSQL, JWT/cookie authentication, WebSocket/STOMP, PayOS, GHN, Cloudinary, mail, and AI integration.
- The initial audit found 192 Java source files and no backend test source files. Maven compiled successfully, but a green build without tests is not a quality gate.
- Hibernate uses `ddl-auto: update`; schema repair/seed behavior exists in startup runners; no Flyway migration set was found.
- Highest-risk findings are direct wallet credit behavior, weak payment-intent binding, duplicated financial mutations, browser-visible token surfaces, broad CSRF/CORS exposure, concurrency gaps, and unsigned/unverified external callbacks.
- Re-check every observation against current code before implementation because this repository can change.

## Principles

1. Correctness and recovery precede performance.
2. Identity is server-derived; authorization is enforced at both boundary and use-case levels.
3. Payment and wallet changes are server-authoritative, idempotent, auditable, and transactionally safe.
4. The database enforces critical invariants; Redis accelerates or stores revocable sessions but is not the source of truth for money.
5. Schema evolves through forward-only Flyway migrations.
6. Build once, promote an immutable artifact, observe it, and retain a tested recovery path.
7. One agent task executes one phase only. Human review approves phase completion and launch.

## Phase sequence

| Phase | Deliverable | Depends on | Why this order matters |
|---|---|---|---|
| 01 | Environment/config baseline | — | Prevent unsafe defaults from contaminating later work. |
| 02 | Flyway migration baseline | 01 | Later security/ledger models need controlled schema evolution. |
| 03 | PayOS/payment hardening | 01–02 | Close direct-credit/replay/ownership paths early. |
| 04 | Ledger and escrow invariants | 02–03 | Centralize all financial state after provider confirmation is trustworthy. |
| 05 | Redis sessions, cookies, CSRF, CORS | 01–02 | Establish revocable browser identity and request integrity. |
| 06 | Authorization perimeter | 05 | Apply ownership/role policy to a stable identity model. |
| 07 | Concurrency/idempotency | 02–06 | Lock down contested transitions after invariants are explicit. |
| 08 | Architecture refactoring | 03–07 | Refactor behind security and correctness regression tests. |
| 09 | Performance/caching | 02–08 | Optimize measured stable behavior without masking correctness bugs. |
| 10 | Operations/launch | 01–09 | Package, observe, rehearse recovery, and obtain human sign-off. |

Phases 03 and 05 can be developed on separate branches after Phases 01–02, but integration must resolve shared security/configuration concerns before approval. Do not parallelize Phases 03, 04, and 07 where they touch the same financial code.

## Target shape

```text
Client browser
  -> TLS/reverse proxy
  -> Spring Security: Redis session + CSRF + explicit CORS
  -> thin REST/WebSocket adapters
  -> application use cases with ownership + transaction boundaries
  -> domain policies (auction, order, wallet/ledger)
  -> PostgreSQL source of truth + Flyway
  -> transactional outbox
  -> external adapters (PayOS, GHN, mail, Cloudinary, AI)

Redis
  -> server-side sessions
  -> explicitly approved non-critical read caches only
```

## Definition of phase completion

A phase is complete only after:

- Scope and exclusions match its reference file in `.agents/skills/harden-thriftly-backend/references/`.
- Required automated tests exist and have actually run.
- Data/security/API compatibility and rollback or forward-fix notes are recorded.
- `git diff --check` and relevant builds pass.
- Evidence is recorded as `READY_FOR_REVIEW`.
- A human reviewer marks it `APPROVED`.

## Explicit non-goals

- No microservice split as a prerequisite for launch.
- No production deployment, secret rotation, paid infrastructure, or real payment execution by an autonomous agent.
- No cache-first optimization and no big-bang rewrite.
