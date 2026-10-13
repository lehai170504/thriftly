# Thriftly Backup and Disaster Recovery Procedure

## 1. RPO and RTO Objectives

- **Recovery Point Objective (RPO)**: <= 15 minutes (continuous WAL archiving and frequent transactional snapshots).
- **Recovery Time Objective (RTO)**: <= 30 minutes (automated restore drill).

## 2. PostgreSQL Backup Strategy

### 2.1 Automated Daily Full Snapshot
Run daily at 02:00 UTC using cron or cloud backup orchestrator:
```bash
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -Fc -Z 6 -f /backups/postgres/thriftly_full_$(date +%Y%m%d_%H%M%S).dump
```

### 2.2 Continuous Write-Ahead Log (WAL) Archiving
Configure `postgresql.conf`:
```ini
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /backups/wal/%f && cp %p /backups/wal/%f'
archive_timeout = 900
```

## 3. Redis Persistence & Backup

Redis holds user sessions and cache.
1. Enable both RDB snapshots and Append-Only File (AOF):
   ```ini
   save 900 1
   save 300 10
   save 60 10000
   appendonly yes
   appendfsync everysec
   ```
2. Periodic backup copy of `/data/dump.rdb` and `/data/appendonly.aof` to offsite cloud storage.

## 4. Point-In-Time Recovery (PITR) Drill

### Step 4.1: Standby Host Preparation
1. Ensure standby PostgreSQL instance is provisioned and stopped:
   ```bash
   systemctl stop postgresql
   ```
2. Clean database cluster directory `/var/lib/postgresql/data`.

### Step 4.2: Restore Base Snapshot
```bash
pg_restore -h localhost -U $DB_USER -d $DB_NAME --clean --if-exists -v /backups/postgres/thriftly_full_latest.dump
```

### Step 4.3: Apply Point-in-Time Recovery
Configure `postgresql.auto.conf`:
```ini
restore_command = 'cp /backups/wal/%f %p'
recovery_target_time = '2026-10-12 14:30:00'
recovery_target_action = 'promote'
```
Start PostgreSQL and verify logs for recovery completion:
```bash
systemctl start postgresql
tail -f /var/log/postgresql/postgresql.log
```

## 5. Post-Restore Data Integrity Verification

Run verification queries to confirm database consistency:
```sql
SELECT count(*) FROM users;
SELECT count(*) FROM orders;
SELECT count(*) FROM wallets;
SELECT sum(balance), sum(held_balance) FROM wallets;
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
```
