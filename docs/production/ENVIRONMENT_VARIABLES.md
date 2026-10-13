# Production Environment Contract

Production must use a secret/config manager or a protected deployment environment file that is never committed. Local `backend/.env` and `frontend/.env.local` remain developer-only and are ignored by Git.

## Backend runtime

Required configuration:

| Area | Variables | Notes |
|---|---|---|
| Runtime | `SPRING_PROFILES_ACTIVE=prod`, `PORT` | Production profile is mandatory. |
| PostgreSQL | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | The database account needs Flyway DDL privileges during migration. |
| Redis/session | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_SSL_ENABLED`, `SESSION_REDIS_NAMESPACE` | Use TLS for managed/external Redis; Docker Compose uses a private unencrypted network. |
| Browser security | `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, `ADMIN_ALLOWED_IPS`, `TRUSTED_PROXY_IPS` | Exact HTTPS origins and actual reverse-proxy CIDRs only; no wildcards. |
| Mail | `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | Needed for OTP and password reset. |
| Google | `GOOGLE_CLIENT_ID` | Must match the frontend Google client ID and allowed origins. |
| PayOS | `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` | Store and rotate as secrets. |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Store API secret outside Git. |
| AI | `AI_API_KEY`, `AI_API_URL`, `AI_MODEL_NAME` | API key is secret. |
| GHN | `GHN_TOKEN`, `GHN_SHOP_ID`, `GHN_WEBHOOK_SECRET`, `GHN_API_URL`, `GHN_DEFAULT_SHIPPING_FEE`, `GHN_ORDER_CREATION_ENABLED` | Keep automatic order creation disabled until the structured shipping contract exists. |

Explicitly review these tunables instead of accepting defaults silently: `DB_POOL_MAX_SIZE`, `DB_POOL_MIN_IDLE`, `REDIS_CONNECT_TIMEOUT`, `REDIS_TIMEOUT`, `SESSION_IDLE_TIMEOUT`, `SESSION_ABSOLUTE_TIMEOUT`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_DOMAIN`, and `SESSION_COOKIE_SAME_SITE`.

`TRUSTED_PROXY_IPS` is security-sensitive. Forwarded client IP headers are honored only when the direct peer matches this allowlist. Configure the load balancer/reverse proxy addresses or CIDRs, never `0.0.0.0/0`.

## Frontend build time

The following values are compiled into the Next.js browser bundle and cannot be changed by setting container runtime variables:

- Required: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_AGORA_APP_ID`.
- Optional by feature: `NEXT_PUBLIC_FACEBOOK_APP_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_FB_PIXEL_ID`.

They are public by definition and must never contain secrets. `INTERNAL_API_URL` is the only server-side frontend runtime URL; in Compose it is `http://backend:8080/api/v1`.

## Cookie topology

- Same-origin reverse proxy, for example `https://thriftly.vn/api`: leave `SESSION_COOKIE_DOMAIN` empty and use host-only cookies.
- Separate same-site subdomains, for example `https://thriftly.vn` and `https://api.thriftly.vn`: set `SESSION_COOKIE_DOMAIN=.thriftly.vn` so the frontend can read the CSRF cookie. Keep `SESSION_COOKIE_SAME_SITE=Lax` and use HTTPS.
- Truly cross-site frontend/API domains require `SameSite=None; Secure` and a specific security review; do not enable this casually.

## Validation before deployment

```powershell
docker compose --env-file <production-env> -f docker-compose.prod.yml config --quiet

cd frontend
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build

cd ..\backend
.\mvnw.cmd clean test -B
```

After rendering Compose, inspect it in a protected terminal to ensure public URLs and hosts are correct. Do not paste rendered output into tickets or logs because it contains resolved secrets.
