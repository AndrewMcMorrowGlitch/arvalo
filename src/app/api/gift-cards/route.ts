import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GiftCardSchema, formatValidationError } from '@/lib/validation/schemas';

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: giftCards, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json({ error: 'Failed to fetch gift cards', details: error.message }, { status: 500 });
  }

  return NextResponse.json(giftCards);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = GiftCardSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(formatValidationError(validation.error), { status: 400 });
  }

  const { retailer, card_number, pin, initial_balance } = validation.data;

  const { data: newGiftCard, error: insertError } = await supabase
    .from('gift_cards')
    .insert({
      user_id: user.id,
      retailer,
      card_number, // TODO: Encrypt this value
      pin, // TODO: Encrypt this value
      initial_balance,
      current_balance: initial_balance,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting gift card:', insertError);
    // TODO: Add more specific error handling based on postgres error codes
    return NextResponse.json({ error: 'Failed to create gift card', details: insertError.message }, { status: 500 });
  }

  // Log to audit_log
  const { error: auditError } = await supabase.from('audit_log').insert({
    user_id: user.id,
    gift_card_id: newGiftCard.id,
    action: 'card_added',
    details: {
      retailer,
      initial_balance,
    },
  });

  if (auditError) {
    console.error('Error creating audit log for new gift card:', auditError);
    // Non-critical error, so we don't return an error response, but we should log it.
  }

  return NextResponse.json(newGiftCard, { status: 201 });
}
