import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionRequests, tenants } from '@/schema/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, user.tenantId)
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const requests = await db.select()
      .from(subscriptionRequests)
      .where(eq(subscriptionRequests.tenantId, user.tenantId))
      .orderBy(desc(subscriptionRequests.createdAt));

    // Fetch new subscription logic tables if they exist (ignoring errors if not migrated yet)
    let activeSubscription = null;
    let tenantInvoices = [];
    try {
      // @ts-ignore - this will work after migrations
      const { tenantSubscriptions, invoices, subscriptionPlans } = await import('@/schema/schema');
      
      const subResult = await db.select()
        .from(tenantSubscriptions)
        .leftJoin(subscriptionPlans, eq(tenantSubscriptions.planId, subscriptionPlans.id))
        .where(eq(tenantSubscriptions.tenantId, user.tenantId))
        .orderBy(desc(tenantSubscriptions.createdAt))
        .limit(1);
        
      if (subResult.length > 0) {
        activeSubscription = subResult[0];
      }
      
      tenantInvoices = await db.select()
        .from(invoices)
        .where(eq(invoices.tenantId, user.tenantId))
        .orderBy(desc(invoices.createdAt));
    } catch (e) {
      console.warn("New subscription schema not yet migrated");
    }

    return NextResponse.json({ tenant, requests, activeSubscription, invoices: tenantInvoices });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch subscription details' }, { status: 500 });
  }
}
