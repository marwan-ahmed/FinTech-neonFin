import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenantSubscriptions, subscriptionPlans, loans, invoices } from '@/schema/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // In a real scenario, this would be a CRON job or called by SuperAdmin
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all active subscriptions that use a percentage plan
    const subscriptions = await db.select({
      subId: tenantSubscriptions.id,
      tenantId: tenantSubscriptions.tenantId,
      percentageRate: subscriptionPlans.percentageRate,
      planName: subscriptionPlans.name,
    })
    .from(tenantSubscriptions)
    .innerJoin(subscriptionPlans, eq(tenantSubscriptions.planId, subscriptionPlans.id))
    .where(and(
      eq(tenantSubscriptions.status, 'active'),
      eq(subscriptionPlans.type, 'percentage')
    ));

    const results = [];

    // Calculate total loans for the month for each tenant
    for (const sub of subscriptions) {
      if (!sub.percentageRate) continue;

      const totalLoansResult = await db.select({
        totalAmount: sql<number>`SUM(${loans.totalDebt})`
      })
      .from(loans)
      .where(and(
        eq(loans.tenantId, sub.tenantId),
        // Simplification: In a real system, you'd filter by the current billing cycle date range
      ));

      const totalAmount = totalLoansResult[0]?.totalAmount || 0;
      
      // Calculate invoice amount
      const invoiceAmount = (totalAmount * Number(sub.percentageRate)) / 100;

      if (invoiceAmount > 0) {
        // Generate Invoice
        const newInvoice = await db.insert(invoices).values({
          tenantId: sub.tenantId,
          subscriptionId: sub.subId,
          amount: invoiceAmount.toString(),
          status: 'draft',
          dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        }).returning();
        
        results.push(newInvoice[0]);
      }
    }

    return NextResponse.json({ processed: results.length, invoices: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process percentages' }, { status: 500 });
  }
}
