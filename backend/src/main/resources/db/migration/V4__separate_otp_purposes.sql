ALTER TABLE otp_tokens
    ADD COLUMN IF NOT EXISTS purpose VARCHAR(32);

UPDATE otp_tokens
SET purpose = 'PASSWORD_RESET'
WHERE purpose IS NULL;

ALTER TABLE otp_tokens
    ALTER COLUMN purpose SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_otp_tokens_user_purpose_used_expiry
    ON otp_tokens (user_id, purpose, is_used, expiry_date DESC);
