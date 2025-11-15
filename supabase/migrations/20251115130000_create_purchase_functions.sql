-- Function to initiate a purchase and lock the gift card
CREATE OR REPLACE FUNCTION initiate_purchase(
    p_gift_card_id UUID,
    p_purchase_amount DECIMAL,
    p_item_description TEXT,
    p_item_id TEXT,
    p_user_id UUID
)
RETURNS TABLE (
    purchase_id UUID,
    card_number TEXT,
    pin TEXT,
    current_balance DECIMAL,
    status TEXT,
    error_message TEXT
) AS $$
DECLARE
    v_gift_card gift_cards;
    v_purchase gift_card_transactions;
BEGIN
    -- Start a transaction and lock the gift card row
    SELECT * INTO v_gift_card FROM gift_cards WHERE id = p_gift_card_id AND user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::DECIMAL, 'error'::TEXT, 'Gift card not found or access denied.'::TEXT;
        RETURN;
    END IF;

    IF v_gift_card.status != 'active' THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::DECIMAL, 'error'::TEXT, 'Gift card is not active.'::TEXT;
        RETURN;
    END IF;

    IF v_gift_card.current_balance < p_purchase_amount THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, v_gift_card.current_balance, 'error'::TEXT, 'Insufficient balance.'::TEXT;
        RETURN;
    END IF;

    -- Create a new purchase record
    INSERT INTO gift_card_transactions (gift_card_id, amount, item_description, item_id, status, balance_before)
    VALUES (p_gift_card_id, p_purchase_amount, p_item_description, p_item_id, 'pending', v_gift_card.current_balance)
    RETURNING * INTO v_purchase;

    -- Log the initiation
    INSERT INTO audit_log (user_id, gift_card_id, purchase_id, action, details)
    VALUES (p_user_id, p_gift_card_id, v_purchase.id, 'purchase_initiated', jsonb_build_object('amount', p_purchase_amount));

    -- Return purchase details and credentials for the external call
    -- IMPORTANT: This returns sensitive data. The API route must handle it securely.
    RETURN QUERY SELECT v_purchase.id, v_gift_card.card_number, v_gift_card.pin, v_gift_card.current_balance, 'success'::TEXT, NULL::TEXT;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return a failure message
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::DECIMAL, 'error'::TEXT, 'An unexpected database error occurred.'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to finalize a purchase after the external API call
CREATE OR REPLACE FUNCTION finalize_purchase(
    p_purchase_id UUID,
    p_is_success BOOLEAN,
    p_failure_reason TEXT,
    p_external_transaction_id TEXT,
    p_user_id UUID
)
RETURNS TABLE (
    purchase_status TEXT,
    final_balance DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    v_purchase gift_card_transactions;
    v_gift_card gift_cards;
    v_new_balance DECIMAL;
BEGIN
    -- Find the pending purchase
    SELECT * INTO v_purchase FROM gift_card_transactions WHERE id = p_purchase_id AND status = 'pending';

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'error'::TEXT, NULL::DECIMAL, 'Pending purchase not found.'::TEXT;
        RETURN;
    END IF;

    -- Lock the associated gift card
    SELECT * INTO v_gift_card FROM gift_cards WHERE id = v_purchase.gift_card_id AND user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        -- This should not happen if RLS is correct
        RETURN QUERY SELECT 'error'::TEXT, NULL::DECIMAL, 'Gift card not found or access denied.'::TEXT;
        RETURN;
    END IF;

    IF p_is_success THEN
        -- On success, deduct balance and complete purchase
        v_new_balance := v_gift_card.current_balance - v_purchase.amount;

        UPDATE gift_cards
        SET
            current_balance = v_new_balance,
            status = CASE WHEN v_new_balance <= 0 THEN 'depleted' ELSE 'active' END,
            updated_at = NOW()
        WHERE id = v_gift_card.id;

        UPDATE gift_card_transactions
        SET
            status = 'completed',
            balance_after = v_new_balance,
            completed_at = NOW(),
            external_transaction_id = p_external_transaction_id
        WHERE id = p_purchase_id;

        -- Log completion
        INSERT INTO audit_log (user_id, gift_card_id, purchase_id, action, details)
        VALUES (p_user_id, v_gift_card.id, p_purchase_id, 'purchase_completed', jsonb_build_object('amount', v_purchase.amount, 'new_balance', v_new_balance));

        RETURN QUERY SELECT 'completed'::TEXT, v_new_balance, NULL::TEXT;

    ELSE
        -- On failure, mark as failed and do not change balance
        UPDATE gift_card_transactions
        SET
            status = 'failed',
            failure_reason = p_failure_reason,
            completed_at = NOW() -- Mark as completed to avoid reprocessing
        WHERE id = p_purchase_id;

        -- Log failure
        INSERT INTO audit_log (user_id, gift_card_id, purchase_id, action, details)
        VALUES (p_user_id, v_gift_card.id, p_purchase_id, 'purchase_failed', jsonb_build_object('amount', v_purchase.amount, 'reason', p_failure_reason));

        RETURN QUERY SELECT 'failed'::TEXT, v_gift_card.current_balance, NULL::TEXT;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return a failure message
        RETURN QUERY SELECT 'error'::TEXT, NULL::DECIMAL, 'An unexpected database error occurred during finalization.'::TEXT;
END;
$$ LANGUAGE plpgsql;
