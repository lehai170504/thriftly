# Thriftly Rollback and Forward-Fix Runbook

## 1. Rollback Decision Triggers & Thresholds

A rollback or forward-fix incident MUST be declared if any of the following occur within 60 minutes post-deployment:
- HTTP 5xx error rate > 0.5% over a 5-minute rolling window.
- Liveness/Readiness probe failure rate > 10% across running backend replicas.
- Database connection pool exhaustion (`HikariPool - Connection is not available, request timed out`).
- Unhandled exceptions in PayOS payment callbacks or ledger transfers.
- Critical data inconsistency detected in wallet balance conservation.

## 2. Decision Tree: Rollback vs Forward-Fix

1. **Forward-Fix Criteria**:
   - The issue is caused by a missing environment variable or configuration typo.
   - The issue can be resolved with a validated patch within 15 minutes.
   - Database schema has already accepted irreversible additive data, and a backward-compatible fix is feasible.
2. **Rollback Criteria**:
   - The root cause is unknown or resolution time exceeds 15 minutes.
   - Core checkout, payment, or auth workflows are broken.
   - Severe performance degradation or memory leak causes cascaded container crashes.

## 3. Step-by-Step Rollback Execution

### Step 3.1: Application Traffic Rollback
1. Point container deployment back to the previously approved image tag:
   ```bash
   docker service update --image thriftly/backend:v0.9.9-stable thriftly_backend
   # Or via Docker Compose:
   sed -i 's/v1.0.0-release/v0.9.9-stable/g' docker-compose.prod.yml
   docker compose -f docker-compose.prod.yml up -d --no-deps backend
   ```
2. Verify previous version health probe status:
   ```bash
   curl -f http://localhost:8080/actuator/health/readiness
   ```

### Step 3.2: Database Schema Rollback
1. Schema changes in Thriftly are designed to be backward-compatible (expand-and-contract pattern).
2. If the previous application code is compatible with the new schema (e.g., added indexes, nullable columns):
   - Leave the database schema as-is to preserve operational stability.
3. If an emergency schema reversal is strictly necessary:
   - Identify the failed migration version from `flyway_schema_history`.
   - Run the reverse SQL script (e.g. `DROP INDEX CONCURRENTLY idx_name;`).
   - Remove the failed record from `flyway_schema_history`:
     ```sql
     DELETE FROM flyway_schema_history WHERE version = 'V3';
     ```

## 4. Communication & Incident Closure

1. Notify operations, customer support, and leadership channel in Slack/Teams:
   `[ROLLBACK COMPLETED] Backend rolled back to v0.9.9-stable. Error rate normalized. Postmortem scheduled.`
2. Capture logs and error traces from the failed deployment before container eviction:
   ```bash
   docker logs thriftly-backend-failed > /var/log/incident_$(date +%Y%m%d).log
   ```
