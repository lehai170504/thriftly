# Thriftly Deployment and Migration Runbook

## 1. Release Architecture & Invariants

1. **Build Once, Deploy Everywhere**:
   - The same immutable container image / JAR artifact verified by CI gates is promoted across staging and production.
   - Backend secrets are injected at runtime, never baked into images.
   - `NEXT_PUBLIC_*` values are public browser configuration and are frozen into the Next.js bundle at build time. Build a separate immutable frontend artifact for each public configuration set; never put secrets in a `NEXT_PUBLIC_*` variable.

2. **Deployment Topology & Ordering**:
   - Order: backup -> PostgreSQL/Redis readiness -> traffic-disabled backend migration instance -> backend replicas -> frontend artifact.
   - Do not claim zero downtime until backward compatibility between the old frontend/backend and migrations `V1` through `V4` has been rehearsed in staging.

## 2. Pre-Deployment Checklist

1. Verify every release gate in `LAUNCH_CHECKLIST.md` has evidence or an explicitly accepted exception. A phase marked `READY_FOR_REVIEW` is not approval.
2. Record immutable backend/frontend image digests, release version, approvers, deployment window, rollback owner, and database backup identifier.
3. Validate the production environment against `ENVIRONMENT_VARIABLES.md`. Run `docker compose --env-file <production-env> -f docker-compose.prod.yml config --quiet` before changing production.
4. Check target production PostgreSQL health and take a pre-migration snapshot:
   ```bash
   pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -Fc -f /backups/pre_deploy_$(date +%Y%m%d_%H%M%S).dump
   ```
5. Verify Redis connectivity and persistent storage:
   ```bash
   redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
   ```

## 3. Migration Execution

1. Flyway runs automatically from the backend artifact. Hibernate is validation-only (`ddl-auto: validate`) and must never create or update the production schema.
2. Start exactly one instance of the same release image with production configuration but without user traffic. Wait for startup and readiness; this applies pending Flyway migrations before application replicas are rolled out. The repository does not configure the standalone Maven Flyway plugin, so do not use an undocumented `mvn flyway:migrate` command.
3. Check `flyway_schema_history` table for clean execution:
   ```sql
   SELECT installed_rank, version, description, type, execution_time, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
   ```
4. Confirm migrations `V1`, `V2`, `V3`, and `V4` are successful. If startup fails, keep traffic on the old release and follow `ROLLBACK_AND_FORWARD_FIX_RUNBOOK.md`; never edit an applied migration in place.

## 4. Rolling Application Deployment

1. Deploy new backend replicas with healthcheck probes:
   - Liveness probe: `GET /actuator/health/liveness` (threshold: 3 failures, interval: 15s)
   - Readiness probe: `GET /actuator/health/readiness` (threshold: 2 failures, interval: 10s)
2. Traffic routing:
   - Only route incoming traffic to replicas that report `status: UP` on `/actuator/health/readiness`.
3. Graceful shutdown:
   - Existing replicas receive `SIGTERM` and finish inflight HTTP requests within the 30-second grace window (`server.shutdown: graceful`).
4. Deploy the frontend image whose build-time `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, Google client ID, and Agora app ID match the production topology.

## 5. Post-Deployment Verification (Smoke Tests)

1. Health probe check:
   ```bash
   curl -f -s https://api.thriftly.vn/actuator/health | jq .status
   ```
2. Verify CSRF token acquisition:
   ```bash
   curl -i -s -c cookies.txt https://api.thriftly.vn/api/v1/auth/csrf
   ```
3. Verify public product catalogue query:
   ```bash
   curl -f -s https://api.thriftly.vn/api/v1/products?page=0&size=5
   ```
4. Verify Prometheus metrics scraping:
   ```bash
   curl -f -s https://api.thriftly.vn/actuator/prometheus | grep "jvm_memory_used_bytes"
   ```
5. Monitor error logs for any exceptions:
   ```bash
   docker logs --tail 200 -f thriftly-backend | grep -i "ERROR"
   ```
6. Complete an authenticated browser smoke test: CSRF acquisition, password login, privileged-user OTP, `/users/me`, one unsafe mutation, logout, PayOS return polling, and WebSocket reconnect.
7. Confirm cookies are `Secure`, the session cookie is `HttpOnly`, the CSRF cookie is readable only on the intended parent domain, and neither token nor user data exists in browser storage.
8. Keep `GHN_ORDER_CREATION_ENABLED=false` until structured receiver ward/district/address and package dimensions are implemented and validated in staging. Manual shipment remains the safe launch path.
