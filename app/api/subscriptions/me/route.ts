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

    return NextResponse.json({ tenant, requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch subscription details' }, { status: 500 });
  }
}
