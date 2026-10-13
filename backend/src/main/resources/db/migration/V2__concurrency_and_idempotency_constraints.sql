CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    order_code BIGINT NOT NULL UNIQUE,
    amount NUMERIC(19, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    provider_transaction_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    expires_at TIMESTAMP,
    version INTEGER,
    PRIMARY KEY (id),
    CONSTRAINT fk_payment_intents_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_order_code ON payment_intents (order_code);
CREATE INDEX IF NOT EXISTS idx_auction_sessions_product_id ON auction_sessions (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders (product_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_session_amount ON auction_bids (auction_session_id, bid_amount DESC);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_wallets_balance_non_negative') THEN
        ALTER TABLE wallets ADD CONSTRAINT chk_wallets_balance_non_negative CHECK (balance >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_wallets_held_balance_non_negative') THEN
        ALTER TABLE wallets ADD CONSTRAINT chk_wallets_held_balance_non_negative CHECK (held_balance >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_vouchers_quantity_non_negative') THEN
        ALTER TABLE vouchers ADD CONSTRAINT chk_vouchers_quantity_non_negative CHECK (quantity >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_quantity_non_negative') THEN
        ALTER TABLE products ADD CONSTRAINT chk_products_quantity_non_negative CHECK (quantity IS NULL OR quantity >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_auction_deposits_user_session') THEN
        ALTER TABLE auction_deposits ADD CONSTRAINT uk_auction_deposits_user_session UNIQUE (user_id, auction_session_id);
    END IF;
END $$;
