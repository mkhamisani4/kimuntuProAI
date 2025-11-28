/**
 * POST /api/logo/save
 * Saves or updates a logo document in Firestore
 * DECISION: If isPrimary=true, unset isPrimary on other user logos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogoAdmin, updateLogoAdmin, unsetPrimaryLogoForUser } from '@kimuntupro/db/firebase/logos.server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      logoId, // If present, update; otherwise, create
      tenantId,
      userId,
      businessPlanId,
      companyName,
      brief,
      concepts,
      currentSpec,
      isPrimary,
      generationMetadata,
    } = body;

    // Validation
    if (!tenantId || !userId || !companyName || !currentSpec) {
      return NextResponse.json(
        { error: 'validation_failed', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // DECISION: If isPrimary=true, unset other logos first
    if (isPrimary) {
      await unsetPrimaryLogoForUser(tenantId, userId);
    }

    let savedLogoId: string;

    if (logoId) {
      // Update existing
      await updateLogoAdmin(logoId, {
        currentSpec,
        isPrimary: isPrimary || false,
      });
      savedLogoId = logoId;
    } else {
      // Create new
      savedLogoId = await createLogoAdmin({
        tenantId,
        userId,
        businessPlanId: businessPlanId || null,
        companyName,
        brief,
        concepts: concepts || [],
        currentSpec,
        isPrimary: isPrimary || false,
        generationMetadata: generationMetadata || null,
      });
    }

    return NextResponse.json({ success: true, logoId: savedLogoId }, { status: 200 });
  } catch (error: any) {
    console.error('[Logo Save] Error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
}
