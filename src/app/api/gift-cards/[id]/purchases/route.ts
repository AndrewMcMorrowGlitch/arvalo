import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UuidSchema } from '@/lib/validation/schemas';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const giftCardId = params.id;
  const validation = UuidSchema.safeParse(giftCardId);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid gift card ID' }, { status: 400 });
  }

  // The RLS policy on the 'purchases' table ensures that users can only
  // access purchases linked to their own gift cards.
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('gift_card_id', giftCardId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase history:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase history', details: error.message }, { status: 500 });
  }

  return NextResponse.json(purchases);
}
