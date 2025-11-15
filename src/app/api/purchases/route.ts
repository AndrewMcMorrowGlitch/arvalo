import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PurchaseSchema, formatValidationError } from '@/lib/validation/schemas';

// This function simulates a call to an external payment processor.
// In a real-world scenario, this would be a request to an actual service.
async function simulateExternalPurchase(
  cardNumber: string,
  pin: string,
  amount: number
): Promise<{ success: boolean; transactionId: string; failureReason?: string }> {
  console.log(`Simulating purchase for card ending in ${cardNumber.slice(-4)} for amount ${amount}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate a 90% success rate
  if (Math.random() < 0.9) {
    console.log('Simulated purchase SUCCEEDED');
    return {
      success: true,
      transactionId: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  } else {
    console.log('Simulated purchase FAILED');
    return {
      success: false,
      transactionId: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      failureReason: 'Card declined by retailer (simulated)',
    };
  }
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = PurchaseSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(formatValidationError(validation.error), { status: 400 });
  }

  const { gift_card_id, amount, item_description, item_id } = validation.data;

  // Step 1: Initiate the purchase and lock the card
  const { data: initiatedData, error: initiatedError } = await supabase.rpc('initiate_purchase', {
    p_gift_card_id: gift_card_id,
    p_purchase_amount: amount,
    p_item_description: item_description,
    p_item_id: item_id,
    p_user_id: user.id,
  }).single();

  if (initiatedError || (initiatedData && initiatedData.status === 'error')) {
    console.error('Error initiating purchase:', initiatedError || initiatedData.error_message);
    return NextResponse.json({ error: initiatedData?.error_message || 'Failed to initiate purchase.' }, { status: 400 });
  }

  const { purchase_id, card_number, pin } = initiatedData;

  // Step 2: Call the external purchase API
  // In a real app, you would never pass decrypted credentials like this.
  // This is a placeholder for a secure integration with a payment provider.
  const externalResult = await simulateExternalPurchase(card_number, pin, amount);

  // Step 3: Finalize the purchase
  const { data: finalizedData, error: finalizedError } = await supabase.rpc('finalize_purchase', {
    p_purchase_id: purchase_id,
    p_is_success: externalResult.success,
    p_failure_reason: externalResult.failureReason,
    p_external_transaction_id: externalResult.transactionId,
    p_user_id: user.id,
  }).single();

  if (finalizedError || (finalizedData && finalizedData.error_message)) {
    console.error('Critical error finalizing purchase:', finalizedError || finalizedData.error_message);
    // If finalization fails, we have a pending purchase that needs manual intervention.
    // This is a critical error that should be alerted on.
    return NextResponse.json({ error: 'A critical error occurred while finalizing the purchase. Please contact support.' }, { status: 500 });
  }

  // Step 4: Return the final result
  if (finalizedData.purchase_status === 'completed') {
    return NextResponse.json({
      status: 'completed',
      purchase_id: purchase_id,
      balance_after: finalizedData.final_balance,
    });
  } else {
    return NextResponse.json({
      status: 'failed',
      purchase_id: purchase_id,
      failure_reason: externalResult.failureReason,
      balance_after: finalizedData.final_balance,
    }, { status: 400 });
  }
}