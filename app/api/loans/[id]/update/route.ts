import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans, loanSchedules } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
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

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
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
    
    const validationResult = updateSchema.safeParse(rawBody);
    if (!validationResult.success) {
       return NextResponse.json({ error: 'Invalid update payload', details: validationResult.error.format() }, { status: 400 });
    }
    const body = validationResult.data;

    // 🔒 استخدام المعاملات (Database Transactions) لمنع حالات التسابق (Race Conditions)
    const transactionResult = await db.transaction(async (tx) => {
      // Fetch the attached schedules inside transaction context
      const schedules = await tx.select().from(loanSchedules).where(eq(loanSchedules.loanId, id)).orderBy(loanSchedules.installmentNumber);

      if (body.action === 'pay_installment') {
          const { installmentNumber, paidAmount } = body;
          const targetSchedule = schedules.find(s => s.installmentNumber === installmentNumber);
          
          if (targetSchedule) {
              const currentPaidAmount = parseFloat(targetSchedule.paidAmount?.toString() || '0');
              const targetAmountStr = typeof paidAmount !== 'undefined' ? paidAmount.toString() : targetSchedule.amount.toString();
              const paymentAmount = parseFloat(targetAmountStr); 
              const totalPaidNow = currentPaidAmount + paymentAmount;
              const installmentAmount = parseFloat(targetSchedule.amount.toString());

              let updatedStatus: 'paid' | 'pending' | 'late' | 'defaulted' = targetSchedule.status;
              let newPaidAt = targetSchedule.paidAt;

              if (totalPaidNow >= installmentAmount) {
                updatedStatus = 'paid';
                newPaidAt = new Date();
              }

              await tx.update(loanSchedules)
                      .set({ status: updatedStatus, paidAmount: totalPaidNow.toString(), paidAt: newPaidAt, updatedAt: new Date() })
                      .where(eq(loanSchedules.id, targetSchedule.id));
          }
      } else if (body.action === 'clear_loan') {
          const pendingSchedules = schedules.filter(s => s.status === 'pending' || s.status === 'late');
          for (const s of pendingSchedules) {
              await tx.update(loanSchedules)
                  .set({ status: 'paid', paidAmount: s.amount.toString(), paidAt: new Date(), updatedAt: new Date() })
                  .where(eq(loanSchedules.id, s.id));
          }
      }

      // Refresh schedules to see updated status
      const updatedSchedules = await tx.select().from(loanSchedules).where(eq(loanSchedules.loanId, id)).orderBy(loanSchedules.installmentNumber);

      const allPaid = updatedSchedules.every(s => s.status === 'paid');
      const newStatus = allPaid ? 'completed' : loan.status;

      const nextPending = updatedSchedules.find(s => s.status === 'pending' || s.status === 'late');
      const nextDue = nextPending ? new Date(nextPending.dueDate) : null;

      const updatedInfo = await tx.update(loans)
                            .set({ status: newStatus, nextDue, updatedAt: new Date() })
                            .where(conditions)
                            .returning();

      return { updatedInfo: updatedInfo[0], schedule: updatedSchedules };
    });

    // Log the update action
    await logAudit({
      tenantId: user.tenantId!,
      userId: user.id || null,
      action: body.action === 'clear_loan' ? 'CLEAR_LOAN' : 'PAY_INSTALLMENT',
      entityType: 'LOAN',
      entityId: id,
      details: body
    });

    return NextResponse.json({ ...transactionResult.updatedInfo, schedule: transactionResult.schedule });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update loan details' }, { status: 500 });
  }
}