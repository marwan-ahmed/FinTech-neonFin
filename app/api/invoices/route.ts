import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/schema/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantInvoices = await db.select()
      .from(invoices)
      .where(eq(invoices.tenantId, user.tenantId))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json(tenantInvoices);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
