import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptionPlans } from '@/schema/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
    return NextResponse.json(plans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, price, percentageRate, billingCycle, features } = await req.json();

    if (!name || !type || !billingCycle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPlan = await db.insert(subscriptionPlans).values({
      name,
      type,
      price: price || null,
      percentageRate: percentageRate || null,
      billingCycle,
      features: features || {},
    }).returning();

    return NextResponse.json(newPlan[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create subscription plan' }, { status: 500 });
  }
}
