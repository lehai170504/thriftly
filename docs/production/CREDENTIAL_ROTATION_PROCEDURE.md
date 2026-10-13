# Thriftly Credential and Secret Rotation Runbook

## 1. Zero-Downtime Secret Rotation Matrix

| Secret / Credential | Impact on Live Users | Rotation Strategy | Dual-Secret Window |
|---|---|---|---|
| PostgreSQL Password | Database disconnect | Alter user pass in PG, rolling update backend | No (Update PG, immediately roll app) |
| Redis Password | Session / Cache disconnect | `CONFIG SET requirepass`, update env, rolling update | Yes (master/replica or runtime config) |
| PayOS API Key / Checksum | Webhook signature rejection | Update PayOS portal and backend env in lockstep | No (immediate restart) |
| Admin / Staff Passwords | None on customers | Update DB user hash, invalidate active sessions | Immediate |
| Session Cookie Name / Secret | Existing sessions logged out | Rotate during scheduled low-traffic maintenance | Graceful re-login |
| Cloudinary API Secret | Media uploads fail | Update Cloudinary & backend env | Yes (secondary API key) |
| AI API Key (Groq / OpenAI) | AI recommendations fallback | Update provider portal & backend env | Yes |

## 2. PostgreSQL Password Rotation Procedure

1. Connect to PostgreSQL via admin console:
   ```sql
   ALTER USER thrift_app WITH PASSWORD 'NewSecurePassword!2026';
   ```
2. Update the secret manager / `.env` with `DB_PASSWORD=NewSecurePassword!2026`.
3. Perform rolling restart of backend containers:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --no-deps backend
   ```
4. Verify `/actuator/health/readiness` reports `status: UP`.

## 3. Emergency Session Revocation Procedure

If session key compromise or token leakage is suspected:
1. Revoke all active Redis sessions across the entire fleet:
   ```bash
   redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD EVAL "for _,k in ipairs(redis.call('keys','thriftly:session:*')) do redis.call('del',k) end" 0
   ```
2. Verify all subsequent requests receive HTTP 401 and redirect to login.
