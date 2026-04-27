import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/schema/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let query = db.select().from(loans);
    
    // If superadmin, return all. Otherwise return only tenant's loans.
    if (user.role !== 'superadmin') {
       query = query.where(eq(loans.tenantId, user.tenantId!)) as any;
    }
    
    const allLoans = await query.orderBy(desc(loans.createdAt));
    return NextResponse.json(allLoans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const result = await db.insert(loans).values({
      tenantId: user.tenantId,
      borrowerName: data.borrowerName,
      phone: data.phone,
      address: data.address,
      job: data.job,
      assetValue: data.assetValue.toString(),
      totalDebt: data.totalDebt.toString(),
      tenure: data.tenure,
      marketCardValue: data.marketCardValue?.toString(),
      saleCardValue: data.saleCardValue?.toString(),
      score: data.score || 'A',
      status: data.status || 'active',
      schedule: data.schedule || [],
      nextDue: data.nextDue ? new Date(data.nextDue) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
  }
}
