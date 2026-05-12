import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { investors } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateInvestorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  capital: z.number().or(z.string()).transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, "Capital must be a non-negative number").optional(),
  type: z.enum(['retail', 'institutional']).optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = user.role === 'superadmin' 
        ? eq(investors.id, id)
        : and(eq(investors.id, id), eq(investors.tenantId, user.tenantId!));

    // Check if investor exists and belongs to tenant
    const existing = await db.select().from(investors).where(conditions).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }

    const rawData = await req.json();
    const validationResult = updateInvestorSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validations failed', details: validationResult.error.format() }, { status: 400 });
    }

    const data = validationResult.data;
    const updateValues: any = { updatedAt: new Date() };
    if (data.name !== undefined) updateValues.name = data.name;
    if (data.capital !== undefined) updateValues.capital = data.capital.toString();
    if (data.type !== undefined) updateValues.type = data.type;

    const result = await db.update(investors)
      .set(updateValues)
      .where(conditions)
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update investor' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = user.role === 'superadmin' 
        ? eq(investors.id, id)
        : and(eq(investors.id, id), eq(investors.tenantId, user.tenantId!));

    // Check existence
    const existing = await db.select().from(investors).where(conditions).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }

    await db.delete(investors).where(conditions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete investor' }, { status: 500 });
  }
}
