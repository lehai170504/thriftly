# ADR 001: Server-side browser sessions

- Status: Proposed
- Date: 2026-10-08
- Owners: User review required

## Context

The current browser flow uses JWT material in cookies and may also expose token-bearing response/user state to JavaScript. Cookie authentication requires CSRF protection; long-lived self-contained tokens are difficult to revoke immediately after logout, password change, account disable, or role change.

## Decision

Use Spring Session backed by Redis for browser authentication. The browser receives only an opaque session identifier in an HttpOnly cookie. Rotate the session ID after authentication and privilege changes. Enforce CSRF on unsafe methods and allow credentialed CORS only from explicit origins. The authenticated profile endpoint restores client user state without returning credentials.

Redis session storage and general application caching use separate namespaces and operational policies. Session truth is not duplicated in a normal cache. API-to-API authentication, if later required, receives a separate threat model rather than reusing browser state accidentally.

## Consequences

- Immediate revocation and multi-instance login are practical.
- Redis becomes required for authenticated traffic and needs HA, monitoring, expiry policy, and defined outage behavior.
- Frontend and backend must migrate together; JWT/refresh-token retirement needs a bounded compatibility window.
- CSRF token transport, proxy TLS, cookie attributes, session lifetime, concurrent-session policy, and serializer upgrades require tests and runbooks.

## Rejected alternatives

- JWT in `localStorage` or JavaScript-readable cookie: increases credential exposure and does not solve CSRF/revocation coherently.
- Long-lived JWT cookie without server state: operational revocation and role/account changes remain weak.
- Disabling CSRF for API paths while using cookies: unsafe because browsers attach cookies automatically.

## Open decisions

- Idle and absolute lifetime; maximum concurrent sessions; remember-me policy.
- Redis topology and behavior during partial outage.
- Whether a future public/mobile API needs separate short-lived token authentication.
