import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  action: z.enum(['pay_installment', 'clear_loan']),
  installmentNumber: z.number().int().positive().optional(),
  paidAmount: z.number().or(z.string()).optional(),
}).refine(data => {
  if (data.action === 'pay_installment' && data.installmentNumber === undefined) {
    return false;
  }
  return true;
}, "installmentNumber is required when action is pay_installment");

export async function PATCH(req: Request, context: { params: Promise<{ id: string, scheduleId: string }> }) {
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

    const loan = result[0];
    const rawBody = await req.json();
    
    // Validate input using Zod
    const validationResult = updateSchema.safeParse(rawBody);
    if (!validationResult.success) {
       return NextResponse.json({ error: 'Invalid update payload', details: validationResult.error.format() }, { status: 400 });
    }
    const body = validationResult.data;

    let newSchedule = loan.schedule;
    if (body.action === 'pay_installment') {
        const { installmentNumber, paidAmount } = body;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newSchedule = (loan.schedule as any[]).map((s: any) => {
            if (s.installmentNumber === installmentNumber) {
                // Handle partial payments
                const currentPaidAmount = parseFloat(s.paidAmount || '0');
                const paymentAmount = parseFloat(paidAmount || s.amount); // fallback to full amount if not provided
                const totalPaidNow = currentPaidAmount + paymentAmount;
                const installmentAmount = parseFloat(s.amount);

                if (totalPaidNow >= installmentAmount) {
                  return { ...s, status: 'paid', paidAmount: totalPaidNow, paidAt: new Date().toISOString() };
                } else {
                  return { ...s, status: 'pending', paidAmount: totalPaidNow, lastPaidAt: new Date().toISOString() }; // remains pending but has some paidAmount
                }
            }
            return s;
        });
    } else if (body.action === 'clear_loan') {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newSchedule = (loan.schedule as any[]).map((s: any) => {
            if (s.status === 'pending') {
                return { ...s, status: 'paid', paidAmount: s.amount, paidAt: new Date().toISOString() };
            }
            return s;
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allPaid = (newSchedule as any[]).every(s => s.status === 'paid');
    const newStatus = allPaid ? 'completed' : loan.status;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextPending = (newSchedule as any[]).find(s => s.status === 'pending');
    const nextDue = nextPending ? new Date(nextPending.dueDate) : null;


    const updated = await db.update(loans)
                          .set({ schedule: newSchedule, status: newStatus, nextDue, updatedAt: new Date() })
                          .where(conditions)
                          .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update loan details' }, { status: 500 });
  }
}
