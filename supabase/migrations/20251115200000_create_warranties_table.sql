-- Create warranties table for tracking product warranties
CREATE TABLE IF NOT EXISTS public.warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,

    -- Product information
    product_name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    retailer TEXT,
    model_number TEXT,
    serial_number TEXT,
    category TEXT,
    purchase_price DECIMAL(10, 2),

    -- Warranty details
    purchase_date DATE NOT NULL,
    warranty_duration_months INTEGER NOT NULL DEFAULT 12,
    warranty_end_date DATE NOT NULL,
    warranty_type TEXT NOT NULL DEFAULT 'manufacturer', -- manufacturer, extended, store
    coverage_type TEXT DEFAULT 'limited', -- limited, full, parts_only
    coverage_details TEXT,

    -- Claim information
    warranty_url TEXT,
    claim_phone TEXT,
    claim_email TEXT,
    claim_process TEXT,
    required_documents JSONB DEFAULT '[]'::jsonb,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'covered', -- covered, expiring_soon, expired, claimed
    days_remaining INTEGER,
    alert_sent BOOLEAN DEFAULT FALSE,

    -- Claim history
    claim_filed_at TIMESTAMP WITH TIME ZONE,
    claim_status TEXT, -- pending, approved, denied, completed
    claim_amount DECIMAL(10, 2),
    claim_notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_warranties_user_id ON public.warranties(user_id);
CREATE INDEX IF NOT EXISTS idx_warranties_purchase_id ON public.warranties(purchase_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON public.warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON public.warranties(warranty_end_date);
CREATE INDEX IF NOT EXISTS idx_warranties_user_status ON public.warranties(user_id, status);

-- Enable Row Level Security
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own warranties"
    ON public.warranties
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own warranties"
    ON public.warranties
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warranties"
    ON public.warranties
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own warranties"
    ON public.warranties
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update days_remaining and status
CREATE OR REPLACE FUNCTION update_warranty_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate days remaining
    NEW.days_remaining := (NEW.warranty_end_date - CURRENT_DATE);

    -- Update status based on days remaining
    IF NEW.days_remaining < 0 THEN
        NEW.status := 'expired';
    ELSIF NEW.days_remaining <= 60 THEN
        NEW.status := 'expiring_soon';
    ELSIF NEW.claim_filed_at IS NOT NULL THEN
        NEW.status := 'claimed';
    ELSE
        NEW.status := 'covered';
    END IF;

    -- Update timestamp
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update warranty status
CREATE TRIGGER trigger_update_warranty_status
    BEFORE INSERT OR UPDATE ON public.warranties
    FOR EACH ROW
    EXECUTE FUNCTION update_warranty_status();

-- Create function to get warranty summary for a user
CREATE OR REPLACE FUNCTION get_warranty_summary(p_user_id UUID)
RETURNS TABLE(
    total_warranties BIGINT,
    covered INTEGER,
    expiring_soon INTEGER,
    expired INTEGER,
    claimed INTEGER,
    total_coverage_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_warranties,
        COUNT(*) FILTER (WHERE status = 'covered')::INTEGER as covered,
        COUNT(*) FILTER (WHERE status = 'expiring_soon')::INTEGER as expiring_soon,
        COUNT(*) FILTER (WHERE status = 'expired')::INTEGER as expired,
        COUNT(*) FILTER (WHERE status = 'claimed')::INTEGER as claimed,
        COALESCE(SUM(purchase_price), 0) as total_coverage_value
    FROM public.warranties
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to find expiring warranties
CREATE OR REPLACE FUNCTION get_expiring_warranties(p_user_id UUID, p_days_threshold INTEGER DEFAULT 60)
RETURNS TABLE(
    id UUID,
    product_name TEXT,
    manufacturer TEXT,
    warranty_end_date DATE,
    days_remaining INTEGER,
    purchase_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.product_name,
        w.manufacturer,
        w.warranty_end_date,
        w.days_remaining,
        w.purchase_price
    FROM public.warranties w
    WHERE w.user_id = p_user_id
        AND w.days_remaining > 0
        AND w.days_remaining <= p_days_threshold
        AND w.status IN ('covered', 'expiring_soon')
    ORDER BY w.days_remaining ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warranties TO authenticated;
GRANT EXECUTE ON FUNCTION get_warranty_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_warranties(UUID, INTEGER) TO authenticated;

-- Add comment
COMMENT ON TABLE public.warranties IS 'Stores warranty information for purchased products with automatic status tracking';
