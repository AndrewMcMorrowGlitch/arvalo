import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/warranties/[id]
 * Get a specific warranty
 */
export async function GET(
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

    const { data: warranty, error } = await supabase
      .from('warranties')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw error;
    }

    if (!warranty) {
      return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
    }

    return NextResponse.json({ warranty });
  } catch (error) {
    console.error('Get warranty error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch warranty',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/warranties/[id]
 * Update a warranty
 */
export async function PATCH(
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

    const { data: warranty, error } = await supabase
      .from('warranties')
      .update(body)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ warranty });
  } catch (error) {
    console.error('Update warranty error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update warranty',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/warranties/[id]
 * Delete a warranty
 */
export async function DELETE(
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

    const { error } = await supabase
      .from('warranties')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete warranty error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete warranty',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
