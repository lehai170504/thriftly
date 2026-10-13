# Phase 05 — Redis browser session, CSRF, cookies, and CORS

## Runtime contract

- PostgreSQL remains the source of truth for users and business data.
- Redis is the only production HTTP-session store. The namespace is `thriftly:session` by default.
- The browser credential is the opaque `THRIFTLY_SESSION` cookie. It is `HttpOnly`, `Path=/`, host-only by default, `SameSite=Lax`, and `Secure` in production.
- `XSRF-TOKEN` is intentionally readable by JavaScript and is not an authentication credential. Axios mirrors it into `X-XSRF-TOKEN` for unsafe requests.
- JWT access/refresh tokens are no longer returned to or persisted by the browser. `/auth/refresh-token` was removed. User state is restored with `GET /api/v1/users/me`.
- Native WebSocket handshakes use the HTTP session cookie. STOMP clients no longer send bearer tokens.

## Session lifecycle

The idle timeout defaults to 30 minutes and is enforced by Spring Session/Redis. An independent absolute lifetime defaults to 12 hours and is checked on every request. Login rotates the session ID before storing the authenticated security context.

Multiple concurrent sessions are allowed. The following events revoke sessions:

- `POST /api/v1/auth/logout`: current session only.
- `POST /api/v1/auth/logout-all`: every session for the principal, then the current session.
- Password reset or authenticated password change: every session.
- Account ban or role change: every session.

If Redis is unavailable, session-backed requests fail closed with HTTP `503`; there is no JWT, local-memory, or database-session fallback.

## CSRF and CORS

CSRF is required for all unsafe cookie-authenticated requests. Only external webhook paths are exempt:

- `/api/v1/payment/payos/webhook`
- `/api/v1/webhooks/**`

The frontend first calls `GET /api/v1/auth/csrf`, then Axios sends credentials and the `X-XSRF-TOKEN` header automatically. CORS credentials are permitted only for the exact origins in `CORS_ALLOWED_ORIGINS`; wildcard credentialed origins are prohibited.

## Environment variables

| Variable | Development default | Production requirement |
|---|---:|---|
| `REDIS_HOST` | `localhost` | Required managed/private Redis host |
| `REDIS_PORT` | `6379` | Provider port |
| `REDIS_PASSWORD` | empty | Secret-manager value |
| `REDIS_SSL_ENABLED` | profile default | `true` unless private provider explicitly differs |
| `REDIS_TIMEOUT` | `2s` | Tune from measured provider latency |
| `REDIS_CONNECT_TIMEOUT` | `2s` | Keep bounded |
| `SESSION_REDIS_NAMESPACE` | `thriftly:session` | Unique per environment |
| `SESSION_IDLE_TIMEOUT` | `30m` | Product/security approval required |
| `SESSION_ABSOLUTE_TIMEOUT` | `12h` | Product/security approval required |
| `SESSION_COOKIE_NAME` | `THRIFTLY_SESSION` | Keep stable during a release |
| `SESSION_COOKIE_SECURE` | `false` | `true` |
| `SESSION_COOKIE_SAME_SITE` | `Lax` | `Lax`; use `None` only with HTTPS and a reviewed cross-site topology |
| `SESSION_COOKIE_DOMAIN` | empty | Prefer empty/host-only; set only when subdomain sharing is required |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Exact HTTPS origins, comma-separated |
| `TRUSTED_PROXY_IPS` | empty | Exact reverse-proxy addresses/CIDRs; required when client IP forwarding is used |

Do not expose the Redis port publicly. Require transport encryption and authentication in production, isolate namespaces per environment, and rotate credentials through the secret manager.

For a same-origin reverse proxy, keep `SESSION_COOKIE_DOMAIN` empty. If the browser UI is on `https://thriftly.vn` and the API is on `https://api.thriftly.vn`, set it to `.thriftly.vn`: both the HttpOnly session cookie and readable CSRF cookie then share the parent domain. Never put unrelated applications on a parent domain that receives these cookies. Forwarded IP headers are trusted only from `TRUSTED_PROXY_IPS`; never use a global CIDR such as `0.0.0.0/0`.

## Coordinated migration

1. Provision Redis and verify TLS/authentication from the backend network.
2. Configure exact frontend origins and production cookie values.
3. Deploy backend and frontend as one coordinated release.
4. Existing JWT/browser-user cookies are deliberately not trusted. Users must sign in again; the backend expires the legacy `token` cookie when it sees one.
5. Confirm `/auth/csrf`, login, `/users/me`, one unsafe mutation, logout, and WebSocket reconnect in browser developer tools.
6. Confirm a session created through application instance A works through instance B with no sticky routing.
7. Stop Redis briefly in staging and confirm protected traffic returns `503` without authenticating from local state.

## Verification

```powershell
cd backend
.\mvnw.cmd -q '-Dtest=SessionAuthenticationServiceTests,SessionCsrfSecurityTests,SessionCookieConfigurationTests,SessionSerializationConfigTests,SessionLifecycleFilterTests,RedisSharedSessionIntegrationTests' test

cd ..\frontend
npm run build
npx eslint src/lib/axios.ts src/lib/websocket.ts src/contexts/AuthContext.tsx src/features/auth/api/authApi.ts src/features/auth/types/auth.ts src/app/admin/layout.tsx src/app/register/page.tsx src/features/auction/hooks/useAuctionSocket.ts src/features/chat/hooks/useChatSocket.tsx src/features/notifications/hooks/useNotificationSocket.ts src/features/live/hooks/useLiveSocket.ts src/components/home/LiveBidsCounter.tsx
```

`RedisSharedSessionIntegrationTests` requires a running Docker daemon and automatically skips when Docker is unavailable. A skipped Redis test is not sufficient to promote this phase to `READY_FOR_REVIEW`.

Manual browser checks:

- `THRIFTLY_SESSION` is HttpOnly; in production it is also Secure.
- No `user`, `token`, access-token, or refresh-token cookie/local-storage entry exists.
- `XSRF-TOKEN` is readable and unsafe calls carry `X-XSRF-TOKEN`.
- An absent or incorrect CSRF header returns `403`.
- An untrusted Origin preflight is rejected.
- The session ID changes at login and disappears on logout.
- Password change, ban, or role change invalidates existing sessions on other browsers.

## Rollback and forward-fix

Rollback must be coordinated across backend and frontend. Revert both applications to the prior authentication contract and require users to sign in again; do not introduce a silent JWT/local-session fallback. Redis session data can expire naturally after rollback and must not be copied into PostgreSQL. If only Redis is unhealthy, restore/fail over Redis or roll forward the infrastructure fix rather than weakening authentication.

No database migration is required by Phase 05. Legacy refresh-token rows/tables may be removed later through a separate reviewed Flyway migration after the migration window.
