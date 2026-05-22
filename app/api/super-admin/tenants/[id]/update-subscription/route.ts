import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['pending', 'active', 'frozen']).optional(),
  subscriptionStatus: z.enum(['trial', 'active', 'expired']).optional(),
  subscriptionEndDate: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const updateData: any = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.subscriptionStatus !== undefined) updateData.subscriptionStatus = parsed.data.subscriptionStatus;
    if (parsed.data.subscriptionEndDate !== undefined) {
      updateData.subscriptionEndDate = parsed.data.subscriptionEndDate ? new Date(parsed.data.subscriptionEndDate) : null;
    }
    updateData.updatedAt = new Date();

    const [updatedTenant] = await db.update(tenants)
      .set(updateData)
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!updatedTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    await logAudit({
      tenantId: tenantId,
      userId: user.id,
      action: 'UPDATE_SUBSCRIPTION',
      entityType: 'TENANT',
      entityId: tenantId,
      details: updateData
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
