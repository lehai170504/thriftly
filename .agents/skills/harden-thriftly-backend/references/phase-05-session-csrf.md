# Phase 05 — Redis session, cookies, CSRF, and CORS

## Objective
Use revocable Redis-backed browser sessions with secure cookie, CSRF, and origin boundaries.

## Prerequisite
Phases 01–02 are `APPROVED`.

## Verify current evidence
- Inspect JWT cookie/filter/service, token-bearing responses, refresh-token storage, frontend persistence, `SecurityConfig`, and `CsrfCookieFilter`.
- Re-check broad API CSRF exclusions and permissive credentialed CORS matchers before editing.

## Implement
- Add Spring Session Redis with namespace, safe serializer, idle timeout, absolute lifetime strategy, fixation protection, ID rotation, logout/revoke, and concurrent-session policy.
- Use only an opaque HttpOnly cookie; configure Secure, SameSite, path, domain, and expiry per environment.
- Remove browser-readable auth tokens and restore user state via authenticated profile endpoint after a bounded migration.
- Require CSRF for every unsafe cookie-authenticated request and implement the frontend cookie/header convention.
- Permit credentials only for exact trusted origins. Define Redis outage, password/role/account change, expiry, and sign-out-all behavior.

## Exclude
Do not add ordinary application cache or unrelated authorization refactors.

## Gate
Tests cover fixation, login, two-instance access, expiry, logout/revoke/disable, CSRF success/failure, CORS/preflight allow/deny, production/dev cookie attributes, frontend errors, and absence of token persistence. Backend and frontend gates pass; migration/rollback is documented.
