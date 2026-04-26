import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/schema/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loan details' }, { status: 500 });
  }
}
