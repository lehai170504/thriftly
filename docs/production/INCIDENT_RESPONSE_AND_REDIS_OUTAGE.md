# Thriftly Incident Response & Outage Runbook

## 1. Incident Severity Definitions

- **SEV-1 (Critical Outage)**: Core transaction or payment down, database inaccessible, data loss risk, or security perimeter breach. Response SLA: < 15 minutes.
- **SEV-2 (Major Degradation)**: High error rate (> 2%), payment webhook delays > 5 minutes, Redis session cluster degraded. Response SLA: < 30 minutes.
- **SEV-3 (Minor Outage)**: Non-critical feature failure (e.g. recommendation service down, image processing slow). Response SLA: < 2 hours.
- **SEV-4 (Informational)**: Minor UI glitch, non-impacting bug. Response SLA: Next business day.

## 2. Redis Outage Behavior & Runbook

### 2.1 System Resilience Under Redis Outage
- **Cache Resilience**: `CacheErrorHandler` suppresses exceptions from Redis and falls back to querying PostgreSQL directly.
- **Session Resilience**: If Redis goes down, `SessionStoreAvailabilityFilter` captures `RedisConnectionFailureException` and responds with a safe `503 Service Unavailable` with `Retry-After: 30`, preventing raw stack trace exposure or partial writes.

### 2.2 Redis Recovery Steps
1. Inspect Redis container/service status:
   ```bash
   docker ps -a | grep redis
   docker logs --tail 100 thriftly-redis
   ```
2. Restart Redis container:
   ```bash
   docker restart thriftly-redis
   ```
3. Test Redis connectivity:
   ```bash
   docker exec -it thriftly-redis redis-cli -a $REDIS_PASSWORD ping
   ```
4. Verify backend auto-reconnects via Lettuce Connection Pool:
   ```bash
   curl -i https://api.thriftly.vn/actuator/health
   ```

## 3. Database Connection Exhaustion Runbook

1. Check current connection activity in PostgreSQL:
   ```sql
   SELECT pid, usename, client_addr, state, query_start, now() - query_start AS duration, query
   FROM pg_stat_activity
   WHERE state != 'idle'
   ORDER BY duration DESC;
   ```
2. Terminate long-running or blocking queries:
   ```sql
   SELECT pg_cancel_backend(pid);
   -- If unresponsive:
   SELECT pg_terminate_backend(pid);
   ```
3. Check HikariCP connection metrics via Actuator:
   ```bash
   curl -s http://localhost:8080/actuator/metrics/hikaricp.connections.active
   curl -s http://localhost:8080/actuator/metrics/hikaricp.connections.idle
   ```

## 4. Postmortem & Blameless Review Template

Every SEV-1/SEV-2 incident requires a postmortem document containing:
1. Incident Timeline (T0 detect, T1 triage, T2 contain, T3 resolve).
2. Root Cause Analysis (5 Whys).
3. Impact Summary (Users affected, financial transactions impacted, downtime minutes).
4. Corrective and Preventive Actions (CAPA) with assigned owners and deadlines.
