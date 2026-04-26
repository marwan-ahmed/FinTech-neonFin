import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { investors } from '@/schema/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allInvestors = await db.select().from(investors).orderBy(desc(investors.createdAt));
    return NextResponse.json(allInvestors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await db.insert(investors).values({
      name: data.name,
      capital: data.capital.toString(),
      type: data.type || 'retail',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create investor' }, { status: 500 });
  }
}
