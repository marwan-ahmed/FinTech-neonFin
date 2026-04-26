import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/schema/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allLoans = await db.select().from(loans).orderBy(desc(loans.createdAt));
    return NextResponse.json(allLoans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await db.insert(loans).values({
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
