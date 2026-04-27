import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = user.role === 'superadmin' 
        ? eq(loans.id, id)
        : and(eq(loans.id, id), eq(loans.tenantId, user.tenantId!));

    const result = await db.select().from(loans).where(conditions).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loan details' }, { status: 500 });
  }
}
