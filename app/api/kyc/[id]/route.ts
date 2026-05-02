import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycApplications } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateKycSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rawBody = await req.json();
    
    const validationResult = updateKycSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: validationResult.error.format() }, { status: 400 });
    }

    const { status } = validationResult.data;

    const conditions = user.role === 'superadmin' 
        ? eq(kycApplications.id, id)
        : and(eq(kycApplications.id, id), eq(kycApplications.tenantId, user.tenantId!));

    const result = await db.update(kycApplications)
                          .set({ status })
                          .where(conditions)
                          .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update KYC application' }, { status: 500 });
  }
}