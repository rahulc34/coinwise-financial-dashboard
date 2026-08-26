CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Not unique because the supplied data contains duplicate IDs
    transaction_id VARCHAR(50) NOT NULL,

    occurred_at TIMESTAMPTZ NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Uncategorized',
    amount NUMERIC(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    is_refund BOOLEAN NOT NULL DEFAULT FALSE,
    source_row_number INTEGER NOT NULL,

    reward_coins INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN status = 'SUCCESS' AND amount > 0
            THEN LEAST(FLOOR(amount / 100)::INTEGER, 100)
            ELSE 0
        END
    ) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_transaction_status
        CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),

    CONSTRAINT unique_source_row
        UNIQUE (source_row_number)
);

CREATE TABLE IF NOT EXISTS reward_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,
    coin_balance INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT non_negative_coin_balance
        CHECK (coin_balance >= 0)
);

CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    coin_cost INTEGER NOT NULL,
    reward_type VARCHAR(30) NOT NULL,
    reward_value NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT positive_reward_cost
        CHECK (coin_cost > 0)
);

CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL
        REFERENCES rewards(id),
    coins_spent INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT positive_coins_spent
        CHECK (coins_spent > 0),

    CONSTRAINT valid_redemption_status
        CHECK (status IN ('COMPLETED', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON transactions(user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_external_id
    ON transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category
    ON transactions(category);

CREATE INDEX IF NOT EXISTS idx_transactions_status
    ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_amount
    ON transactions(amount);

CREATE INDEX IF NOT EXISTS idx_transactions_merchant_lower
    ON transactions(LOWER(merchant));