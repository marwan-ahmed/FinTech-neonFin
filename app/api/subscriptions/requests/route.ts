import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionRequests, tenants } from '@/schema/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await db.select({
      id: subscriptionRequests.id,
      tenantId: subscriptionRequests.tenantId,
      requestedPlan: subscriptionRequests.requestedPlan,
      paymentMethod: subscriptionRequests.paymentMethod,
      status: subscriptionRequests.status,
      notes: subscriptionRequests.notes,
      createdAt: subscriptionRequests.createdAt,
      tenantName: tenants.name,
    })
      .from(subscriptionRequests)
      .leftJoin(tenants, eq(subscriptionRequests.tenantId, tenants.id))
      .orderBy(desc(subscriptionRequests.createdAt));

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch subscription requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestedPlan, paymentMethod, notes } = await req.json();

    if (!requestedPlan || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if there's already a pending request
    const existing = await db.query.subscriptionRequests.findFirst({
      where: (requests, { eq, and }) => 
        and(eq(requests.tenantId, user.tenantId!), eq(requests.status, 'pending'))
    });

    if (existing) {
      return NextResponse.json({ error: 'You already have a pending subscription request.' }, { status: 400 });
    }

    const newRequest = await db.insert(subscriptionRequests).values({
      tenantId: user.tenantId,
      requestedPlan,
      paymentMethod,
      notes,
    }).returning();

    return NextResponse.json(newRequest[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
