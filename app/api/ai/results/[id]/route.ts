/**
 * DELETE /api/ai/results/[id]
 * Delete an assistant result by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteAssistantResultAdmin } from '@kimuntupro/db/firebase/assistantResults.server';

/**
 * DELETE handler - Delete assistant result
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: resultId } = await params;

    if (!resultId) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Result ID is required' },
        { status: 400 }
      );
    }

    // Delete the assistant result
    await deleteAssistantResultAdmin(resultId);

    return NextResponse.json(
      { success: true, message: 'Result deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Delete assistant result error:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Failed to delete result',
      },
      { status: 500 }
    );
  }
}
