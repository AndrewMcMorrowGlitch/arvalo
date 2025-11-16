import { NextRequest, NextResponse } from 'next/server';
import { warrantyAgent } from '@/lib/agents/warranty-agent';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/warranties/[id]/claim
 * File a warranty claim with the Warranty Agent's help
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { issueDescription } = body;

    if (!issueDescription) {
      return NextResponse.json(
        { error: 'Missing required field: issueDescription' },
        { status: 400 }
      );
    }

    console.log('[API] Filing warranty claim with agent for warranty:', params.id);

    // Use warranty agent to help file the claim
    const result = await warrantyAgent.fileWarrantyClaim(
      params.id,
      issueDescription,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Claim filing failed' },
        { status: 500 }
      );
    }

    // Update warranty in database
    const { error: updateError } = await supabase
      .from('warranties')
      .update({
        claim_filed_at: new Date().toISOString(),
        claim_status: 'pending',
        claim_notes: issueDescription,
      })
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update warranty:', updateError);
    }

    return NextResponse.json({
      success: true,
      claim_guide: result.data,
      metadata: {
        iterations: result.iterations,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
      },
    });
  } catch (error) {
    console.error('Warranty claim API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to file warranty claim',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
