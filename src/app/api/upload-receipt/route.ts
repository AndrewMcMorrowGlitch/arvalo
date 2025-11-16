import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { receiptAgent } from '@/lib/agents/receipt-agent';

/**
 * POST /api/upload-receipt - Upload and process receipt image
 * Now uses Receipt Agent with warranty extraction
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPG, PNG, WebP, or PDF file.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    console.log('[API] Processing receipt with Receipt Agent (includes warranty extraction)...');

    // Use Receipt Agent to process the receipt (includes warranty extraction)
    const result = await receiptAgent.processReceipt(base64, file.type, user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to process receipt',
          details: result.error
        },
        { status: 500 }
      );
    }

    console.log('[API] Receipt processed successfully:', {
      merchant: result.data.merchant,
      total: result.data.total,
      itemCount: result.data.items.length,
      warrantyCount: result.data.warranties?.length || 0,
    });

    // Return extracted data for user confirmation (don't save yet)
    return NextResponse.json({
      success: true,
      extractedData: result.data,
      warranties: result.data.warranties || [],
      metadata: {
        iterations: result.iterations,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
      },
    });
  } catch (error) {
    console.error('Error processing receipt upload:', error);
    return NextResponse.json(
      {
        error: 'Failed to process receipt upload',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
