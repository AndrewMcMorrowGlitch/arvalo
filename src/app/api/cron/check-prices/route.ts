import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { checkProductPrice } from '@/lib/bright-data/price-tracker';
import { autoHandlePriceDropRefund } from '@/lib/refund/auto-price-drop';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or service role key is not configured');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseClient();
    // Get all active price tracking records that need checking
    const { data: trackingRecords, error } = await supabase
      .from('price_tracking')
      .select('*, purchases!inner(user_id, merchant_name, purchase_date, total_amount, items)')
      .eq('tracking_active', true)
      .lt(
        'last_checked',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      ) // Last checked > 24h ago
      .limit(50); // Process 50 at a time to avoid timeouts

    if (error) throw error;

    const results = [];

    for (const record of trackingRecords || []) {
      try {
        const priceResult = await checkProductPrice(record.product_url);

        // Update price history
        const priceHistory = record.price_history || [];
        priceHistory.push({
          date: priceResult.timestamp,
          price: priceResult.current_price,
          available: priceResult.available,
        });

        // Detect price drop (5% threshold)
        const priceDrop =
          priceResult.current_price < record.original_price * 0.95;

        // Update database
        await supabase
          .from('price_tracking')
          .update({
            current_price: priceResult.current_price,
            lowest_price: Math.min(
              record.lowest_price || Infinity,
              priceResult.current_price
            ),
            price_history: priceHistory,
            last_checked: new Date().toISOString(),
            price_drop_detected: priceDrop,
            price_drop_amount: priceDrop
              ? record.original_price - priceResult.current_price
              : null,
            price_drop_date: priceDrop ? new Date().toISOString() : null,
          })
          .eq('id', record.id);

        // Create notification if price dropped
        if (priceDrop) {
          await supabase.from('notifications').insert({
            user_id: record.purchases.user_id,
            purchase_id: record.purchase_id,
            type: 'price_drop',
            title: 'Price Drop Detected!',
            message: `${record.product_name} dropped from $${record.original_price} to $${priceResult.current_price}. Save $${(record.original_price - priceResult.current_price).toFixed(2)}!`,
            priority: 'high',
          });

          await autoHandlePriceDropRefund({
            supabase,
            purchase: {
              id: record.purchase_id,
              user_id: record.purchases.user_id,
              merchant_name: record.purchases.merchant_name,
              purchase_date: record.purchases.purchase_date,
              total_amount: record.purchases.total_amount,
              items: record.purchases.items || [],
            },
            currentPrice: priceResult.current_price,
            trigger: 'cron',
          });
        }

        results.push({ success: true, id: record.id });
      } catch (error) {
        console.error(`Failed to check price for ${record.id}:`, error);
        results.push({ success: false, id: record.id, error: String(error) });
      }

      // Rate limiting: wait 2 seconds between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      checked: results.length,
      results,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}
