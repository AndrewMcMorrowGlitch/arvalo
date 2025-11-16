-- Table: purchase_history
CREATE TABLE IF NOT EXISTS purchase_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    store TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_date ON purchase_history(purchase_date DESC);

ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their purchase history" ON purchase_history
FOR ALL USING (user_id = auth.uid());

-- Table: calendar
CREATE TABLE IF NOT EXISTS calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    item_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON calendar(user_id, date);
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their calendar items" ON calendar
FOR ALL USING (user_id = auth.uid());

-- Table: recurrent_purchases
CREATE TABLE IF NOT EXISTS recurrent_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    store TEXT,
    avg_interval_days INTEGER NOT NULL,
    next_purchase_date TIMESTAMPTZ,
    last_purchase_date TIMESTAMPTZ,
    product_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_recurrent_purchase_user_item_store
ON recurrent_purchases(user_id, item_name, store);

ALTER TABLE recurrent_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their recurrent purchases" ON recurrent_purchases
FOR ALL USING (user_id = auth.uid());
