# Backend Rules

Apply these rules to all work under `backend/` in addition to `.agents/AGENTS.md`.

## Architecture

- Target Java 17 and the Spring Boot version pinned by the project. Do not upgrade dependencies incidentally.
- Preserve the feature-oriented modular-monolith structure. Keep controllers responsible for HTTP concerns only; place use-case orchestration and transaction boundaries in application services.
- Repositories own persistence queries. Mappers must be deterministic and must not call repositories or external services.
- Validate request DTOs at the boundary. Return the repository's standard error shape through centralized exception handling; never leak stack traces, SQL, tokens, or secrets.
- Reuse established abstractions when their semantics match. Do not create generic base layers merely to reduce line count.

## Database and money

- Flyway migrations are the only schema-changing mechanism. Production-like profiles use `spring.jpa.hibernate.ddl-auto=validate`.
- Never add startup DDL, schema mutation in seeders, or edits to an already-applied migration. Add a new forward migration.
- Test PostgreSQL-specific SQL, constraints, and locks against PostgreSQL/Testcontainers rather than relying only on H2.
- All wallet, payment, refund, bid, purchase, and escrow state transitions must be atomic, idempotent, authorized, auditable, and expressed in integer minor units or the existing exact decimal policy.
- Change balances only through the designated wallet/ledger service. Enforce non-negative balances and uniqueness/idempotency at the database level where possible.

## Security

- Derive identity from the authenticated principal/session, never from a client-supplied user ID.
- Enforce ownership and role checks in the service layer as well as route-level rules.
- Browser authentication uses server-side sessions, HttpOnly cookies, CSRF protection for unsafe methods, and an explicit CORS allowlist. Never expose access or refresh tokens to JavaScript.
- Verify webhook signatures over the required raw/canonical payload, bind callbacks to a server-created payment intent, reject amount/currency/owner mismatches, and make processing idempotent.
- WebSocket/STOMP authentication and authorization must protect both connection and destination subscriptions/sends.

## Concurrency, caching, and side effects

- Define the locking or optimistic-version strategy for every contested transition. Keep transactions short and use a consistent lock order.
- External calls, email, and WebSocket notifications occur after commit through an outbox/event boundary when correctness depends on committed state.
- Cache only explicitly approved read models. Define key, TTL, invalidation, ownership boundary, and stale-data behavior. Do not cache balances, authorization decisions, bids that determine winners, or session truth as ordinary application cache data.

## Verification

- Add unit tests for business rules, integration tests for persistence/security, and concurrency tests for contested money or auction paths.
- Run targeted tests while iterating, then `./mvnw clean test` (or `.\mvnw.cmd clean test` on Windows) and `git diff --check`.
- A green build with zero discovered tests is not sufficient evidence.
