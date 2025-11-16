import { NextRequest, NextResponse } from 'next/server';
import { priceDetectiveAgent } from '@/lib/agents';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/agents/price-check
 * Check for price drops using the Price Detective Agent
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { purchaseId, monitorAll } = body;

    let result;

    if (monitorAll) {
      // Monitor all purchases for the user
      console.log('[API] Monitoring all purchases for price drops...');
      result = await priceDetectiveAgent.monitorAllPurchases(user.id);
    } else if (purchaseId) {
      // Check specific purchase
      console.log('[API] Checking price drops for purchase:', purchaseId);
      result = await priceDetectiveAgent.checkPriceDrops(purchaseId, user.id);
    } else {
      return NextResponse.json(
        { error: 'Missing required field: purchaseId or monitorAll' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Price check failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        iterations: result.iterations,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        toolsUsed: result.toolsUsed,
      },
    });
  } catch (error) {
    console.error('Price detective agent API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check prices',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
