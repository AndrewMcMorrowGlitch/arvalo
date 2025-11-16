import { NextRequest, NextResponse } from 'next/server';
import { warrantyAgent } from '@/lib/agents/warranty-agent';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/warranties
 * Get all warranties for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get warranties from database
    const { data: warranties, error } = await supabase
      .from('warranties')
      .select('*')
      .eq('user_id', user.id)
      .order('warranty_end_date', { ascending: true });

    if (error) {
      throw error;
    }

    // Get summary using database function
    const { data: summary } = await supabase
      .rpc('get_warranty_summary', { p_user_id: user.id })
      .single();

    return NextResponse.json({
      warranties: warranties || [],
      summary: summary || {
        total_warranties: 0,
        covered: 0,
        expiring_soon: 0,
        expired: 0,
        claimed: 0,
        total_coverage_value: 0,
      },
    });
  } catch (error) {
    console.error('Get warranties error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch warranties',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/warranties
 * Create a new warranty or extract from purchase
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
    const { purchase, extract } = body;

    if (extract && purchase) {
      // Use warranty agent to extract warranty information
      console.log('[API] Extracting warranty with agent for purchase:', purchase.id);
      const result = await warrantyAgent.extractWarranty(purchase, user.id);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Warranty extraction failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        warranties: result.data,
        metadata: {
          iterations: result.iterations,
          tokensUsed: result.tokensUsed,
          cost: result.cost,
        },
      });
    } else {
      // Manual warranty creation
      const { data: warranty, error } = await supabase
        .from('warranties')
        .insert({
          user_id: user.id,
          ...body,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ warranty });
    }
  } catch (error) {
    console.error('Create warranty error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create warranty',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
