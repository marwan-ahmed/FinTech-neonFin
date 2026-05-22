import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycApplications } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { tenantAndCondition } from '@/lib/tenant';
import { z } from 'zod';

const updateKycSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    if (!user || (!user.tenantId && user.role !== 'superadmin')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rawBody = await req.json();
    
    const validationResult = updateKycSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid payload', details: validationResult.error.format() }, { status: 400 });
    }

    const { status } = validationResult.data;

    const conditions = tenantAndCondition(kycApplications.tenantId, user, eq(kycApplications.id, id));

    const existing = await db.select().from(kycApplications).where(conditions).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const result = await db.update(kycApplications)
                          .set({ status })
                          .where(conditions)
                          .returning();

    // 🔒 تسجيل العملية أمنياً في سجلات التدقيق (Audit Logs)
    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: status === 'approved' ? 'APPROVE_KYC_DOCS' : 'REJECT_KYC_DOCS',
      entityType: 'KYC_APPLICATION',
      entityId: id,
      details: { name: existing[0].name, type: existing[0].type, updatedStatus: status }
    });
    
    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("PATCH KYC ERROR:", error);
    return NextResponse.json({ error: 'Failed to update KYC application', details: error.message }, { status: 500 });
  }
}