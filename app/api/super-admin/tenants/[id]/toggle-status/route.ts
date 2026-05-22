import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    
    if (typeof body.status !== 'string' || !['active', 'frozen'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid input. status must be active or frozen.' }, { status: 400 });
    }

    const [updatedTenant] = await db.update(tenants)
      .set({ status: body.status as any, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!updatedTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    await logAudit({
      tenantId: tenantId,
      userId: user.id,
      action: body.status === 'active' ? 'UNFREEZE_TENANT' : 'FREEZE_TENANT',
      entityType: 'TENANT',
      entityId: tenantId,
      details: { status: body.status }
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error('Error toggling tenant status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
