-- Table: gift_cards
CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    retailer TEXT NOT NULL,
    card_number TEXT NOT NULL, -- TODO: Encrypt in production
    pin TEXT NOT NULL, -- TODO: Encrypt in production
    initial_balance DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, depleted, expired, invalid
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT positive_balance CHECK (current_balance >= 0),
    CONSTRAINT valid_initial_balance CHECK (initial_balance > 0)
);

CREATE INDEX idx_gift_cards_user_id ON gift_cards(user_id);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);

-- RLS for gift_cards
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own gift cards"
ON gift_cards FOR ALL
USING (user_id = auth.uid());


-- Table: purchases
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    item_description TEXT,
    item_id TEXT, -- External item reference
    status TEXT NOT NULL, -- pending, completed, failed, cancelled
    failure_reason TEXT,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2),
    external_transaction_id TEXT, -- From purchase API
    idempotency_key TEXT UNIQUE, -- From spec for idempotency
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_purchases_gift_card_id ON purchases(gift_card_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- RLS for purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own purchases"
ON purchases FOR ALL
USING (gift_card_id IN (SELECT id FROM gift_cards WHERE user_id = auth.uid()));


-- Table: audit_log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID REFERENCES gift_cards(id) ON DELETE SET NULL,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Added for better tracking
    action TEXT NOT NULL, -- card_added, purchase_initiated, purchase_completed, purchase_failed, balance_adjusted
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_gift_card_id ON audit_log(gift_card_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

-- RLS for audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own audit logs"
ON audit_log FOR ALL
USING (user_id = auth.uid());