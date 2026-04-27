import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { investors } from '@/schema/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let query = db.select().from(investors);
    
    // If superadmin, return all. Otherwise return only tenant's investors.
    if (user.role !== 'superadmin') {
       query = query.where(eq(investors.tenantId, user.tenantId!)) as any;
    }

    const allInvestors = await query.orderBy(desc(investors.createdAt));
    return NextResponse.json(allInvestors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch investors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const result = await db.insert(investors).values({
      tenantId: user.tenantId,
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
