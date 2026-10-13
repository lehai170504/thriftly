# Thriftly Payment and Ledger Reconciliation Runbook

## 1. Accounting Model & Financial Conservation Invariant

Thriftly adheres to strict double-entry ledger accounting and financial conservation:
$$\sum \text{Wallet Available Balance} + \sum \text{Wallet Held Escrow} + \sum \text{Admin System Fee Balance} = \sum \text{Completed PayOS Inbound Deposits} - \sum \text{Approved Outbound Withdrawals}$$

Any difference ($\Delta \neq 0$) indicates an anomaly that must trigger an immediate freeze and audit.

## 2. Daily Automated Reconciliation Query

Run daily at 00:05 UTC:

```sql
-- 1. Total Wallets Funds
SELECT 
    COALESCE(SUM(balance), 0) AS total_available_balance,
    COALESCE(SUM(held_balance), 0) AS total_held_escrow,
    COALESCE(SUM(balance + held_balance), 0) AS total_wallet_liabilities
FROM wallets;

-- 2. Total Inbound Deposits through PayOS
SELECT 
    COALESCE(SUM(amount), 0) AS total_payos_deposits
FROM payment_intents
WHERE status = 'PAID';

-- 3. Total Outbound Withdrawals Approved
SELECT 
    COALESCE(SUM(amount), 0) AS total_completed_withdrawals
FROM transactions
WHERE type = 'WITHDRAW' AND status = 'COMPLETED';

-- 4. Discrepancy Detection Query
WITH funds AS (
    SELECT COALESCE(SUM(balance + held_balance), 0) AS total_wallets FROM wallets
),
intents AS (
    SELECT COALESCE(SUM(amount), 0) AS total_deposits FROM payment_intents WHERE status = 'PAID'
),
withdrawals AS (
    SELECT COALESCE(SUM(amount), 0) AS total_withdrawals FROM transactions WHERE type = 'WITHDRAW' AND status = 'COMPLETED'
)
SELECT 
    funds.total_wallets,
    intents.total_deposits,
    withdrawals.total_withdrawals,
    (funds.total_wallets - (intents.total_deposits - withdrawals.total_withdrawals)) AS discrepancy_amount
FROM funds, intents, withdrawals;
```

## 3. Webhook Idempotency & Orphaned Intent Resolution

If a PayOS webhook fails to deliver or user closes browser:
1. Query pending intents older than 30 minutes:
   ```sql
   SELECT id, order_code, user_id, amount, status, created_at
   FROM payment_intents
   WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '30 minutes';
   ```
2. Query PayOS API using SDK/CLI for each order code:
   ```bash
   curl -X GET "https://api-merchant.payos.vn/v2/payment-requests/{order_code}" \
     -H "x-client-id: $PAYOS_CLIENT_ID" \
     -H "x-api-key: $PAYOS_API_KEY"
   ```
3. If PayOS confirms `PAID`, process through `WalletService.processPaymentIntentWebhook` idempotently.
4. If PayOS confirms `EXPIRED` or `CANCELLED`, mark intent `CANCELLED`.

## 4. Discrepancy Escalation Protocol

1. If `discrepancy_amount != 0`:
   - Immediately notify Finance Lead and Lead Engineer.
   - Lock withdrawal processing (`SystemConfig.isMaintenanceMode = true`).
   - Audit `transactions` ledger history for the discrepancy timestamp window.
   - Do not adjust balances manually without dual-sign-off approval recorded in audit logs.
