import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { investors, investorDistributions } from '@/schema/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { tenantCondition } from '@/lib/tenant';
import { z } from 'zod';

const investorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  capital: z.number().or(z.string()).transform((val) => Number(val)).refine((val) => !isNaN(val) && val > 0, "Capital must be a positive number"),
  type: z.enum(['retail', 'institutional']).optional().default('retail'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = tenantCondition(investors.tenantId, user);

    const allInvestors = await db.select({
      id: investors.id,
      tenantId: investors.tenantId,
      name: investors.name,
      capital: investors.capital,
      type: investors.type,
      createdAt: investors.createdAt,
      updatedAt: investors.updatedAt,
      earnings: sql<string>`COALESCE(SUM(${investorDistributions.amount}), 0)`
    })
      .from(investors)
      .leftJoin(investorDistributions, eq(investors.id, investorDistributions.investorId))
      .where(conditions)
      .groupBy(investors.id)
      .orderBy(desc(investors.createdAt))
      .limit(limit)
      .offset(offset);

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

    const rawData = await req.json();
    
    // Validate input using Zod
    const validationResult = investorSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validations failed', details: validationResult.error.format() }, { status: 400 });
    }
    
    const data = validationResult.data;

    const result = await db.insert(investors).values({
      tenantId: user.tenantId,
      name: data.name,
      capital: data.capital.toString(),
      type: data.type,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Audit log
    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'CREATE_INVESTOR',
      entityType: 'INVESTOR',
      entityId: result[0].id,
      details: { name: data.name, capital: data.capital, type: data.type }
    });
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create investor' }, { status: 500 });
  }
}
