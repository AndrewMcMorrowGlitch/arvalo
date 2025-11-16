import { NextRequest, NextResponse } from 'next/server';
import { receiptAgent } from '@/lib/agents';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/agents/receipt
 * Process a receipt using the Receipt Agent
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
    const { imageData, mimeType } = body;

    if (!imageData || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData, mimeType' },
        { status: 400 }
      );
    }

    // Process receipt with agent
    console.log('[API] Processing receipt with agent...');
    const result = await receiptAgent.processReceipt(
      imageData,
      mimeType,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Receipt processing failed' },
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
    console.error('Receipt agent API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process receipt',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
