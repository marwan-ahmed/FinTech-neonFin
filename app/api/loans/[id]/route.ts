import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans, loanSchedules } from '@/schema/schema';
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
    
    // Fetch attached schedules
    const schedules = await db.select().from(loanSchedules).where(eq(loanSchedules.loanId, id)).orderBy(loanSchedules.installmentNumber);

    const loanWithSchedules = {
        ...result[0],
        schedule: schedules
    };

    return NextResponse.json(loanWithSchedules);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loan details' }, { status: 500 });
  }
}
