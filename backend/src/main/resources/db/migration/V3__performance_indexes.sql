CREATE INDEX IF NOT EXISTS idx_orders_buyer_created ON orders (buyer_id, deleted_by_buyer, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller_created ON orders (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_updated ON orders (status, updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders (tracking_code) WHERE tracking_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_status_created ON products (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products (category_id, status);
CREATE INDEX IF NOT EXISTS idx_products_sell_type_status ON products (sell_type, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews (order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_created ON reviews (reviewee_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_created ON transactions (wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions (reference_id) WHERE reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers (code);
