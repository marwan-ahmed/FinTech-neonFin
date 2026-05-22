import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionRequests, tenants } from '@/schema/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const p = await params;
    const requestId = p.id;
    const { action } = await req.json(); // 'approve' or 'reject'

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Fetch the request
    const requestObj = await db.query.subscriptionRequests.findFirst({
      where: eq(subscriptionRequests.id, requestId)
    });

    if (!requestObj) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (requestObj.status !== 'pending') {
      return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
    }

    if (action === 'approve') {
      // Calculate new end date based on plan
      let newEndDate = new Date();
      if (requestObj.requestedPlan === 'monthly') {
        newEndDate.setDate(newEndDate.getDate() + 30);
      } else if (requestObj.requestedPlan === 'yearly') {
        newEndDate.setDate(newEndDate.getDate() + 365);
      } else if (requestObj.requestedPlan === 'percentage') {
        // Percentage plan may not have a strict expiry, but we can set it to 1 year for review, or keep it null.
        // Let's set it to 1 year as a renewal period.
        newEndDate.setDate(newEndDate.getDate() + 365);
      } else {
        newEndDate.setDate(newEndDate.getDate() + 30);
      }

      // Update tenant
      await db.update(tenants)
        .set({
          subscriptionStatus: 'active',
          subscriptionPlan: requestObj.requestedPlan as any,
          subscriptionEndDate: newEndDate,
          status: 'active' // also make sure tenant is active
        })
        .where(eq(tenants.id, requestObj.tenantId));

      // Update request
      await db.update(subscriptionRequests)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(subscriptionRequests.id, requestId));
        
      await logAudit({
        tenantId: requestObj.tenantId,
        userId: user.id,
        action: 'APPROVE_SUBSCRIPTION',
        entityType: 'TENANT',
        entityId: requestObj.tenantId,
        details: { plan: requestObj.requestedPlan }
      });

      return NextResponse.json({ success: true, status: 'approved', newEndDate });
    } else {
      // Reject
      await db.update(subscriptionRequests)
        .set({ status: 'rejected', updatedAt: new Date() })
        .where(eq(subscriptionRequests.id, requestId));
        
      return NextResponse.json({ success: true, status: 'rejected' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
