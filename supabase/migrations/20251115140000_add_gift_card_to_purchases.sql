-- Add gift_card_id column to purchases table to link purchases with gift cards
-- This allows tracking which gift card was used for a purchase

ALTER TABLE purchases ADD COLUMN gift_card_id UUID REFERENCES gift_cards(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_purchases_gift_card_id ON purchases(gift_card_id);

-- Add comment for documentation
COMMENT ON COLUMN purchases.gift_card_id IS 'Optional reference to the gift card used for this purchase. When set, the purchase amount is deducted from the gift card balance.';
