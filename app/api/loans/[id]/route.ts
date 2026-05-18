import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans, loanSchedules } from '@/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const editLoanSchema = z.object({
  borrowerName: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  job: z.string().optional().nullable(),
  status: z.enum(['pending', 'approved', 'active', 'completed', 'defaulted']).optional(),
});

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
    
    // 🔒 3.1: عزل المستأجرين لمنع الاختراق البيني للبيانات (Defense-in-depth isolation)
    const scheduleConditions = user.role === 'superadmin'
        ? eq(loanSchedules.loanId, id)
        : and(eq(loanSchedules.loanId, id), eq(loanSchedules.tenantId, user.tenantId!));

    // Fetch attached schedules
    const schedules = await db.select().from(loanSchedules).where(scheduleConditions).orderBy(loanSchedules.installmentNumber);

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

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = user.role === 'superadmin' 
        ? eq(loans.id, id)
        : and(eq(loans.id, id), eq(loans.tenantId, user.tenantId));

    const existing = await db.select().from(loans).where(conditions).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    const rawBody = await req.json();
    const validationResult = editLoanSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.format() }, { status: 400 });
    }

    const data = validationResult.data;
    const updatePayload: any = { updatedAt: new Date() };
    if (data.borrowerName) updatePayload.borrowerName = data.borrowerName;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.job !== undefined) updatePayload.job = data.job;
    if (data.status) updatePayload.status = data.status;

    const result = await db.update(loans)
      .set(updatePayload)
      .where(conditions)
      .returning();

    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'UPDATE_LOAN_INFO',
      entityType: 'LOAN',
      entityId: id,
      details: updatePayload
    });

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("PATCH LOAN ERROR:", error);
    return NextResponse.json({ error: 'Failed to update loan details', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = user.role === 'superadmin' 
        ? eq(loans.id, id)
        : and(eq(loans.id, id), eq(loans.tenantId, user.tenantId));

    const existing = await db.select().from(loans).where(conditions).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // 🔒 3.2: استخدام المعاملات (Database Transactions) لضمان موثوقية الحذف المتزامن ومنع الأخطاء المتقاطعة
    await db.transaction(async (tx) => {
      const scheduleConditions = user.role === 'superadmin'
          ? eq(loanSchedules.loanId, id)
          : and(eq(loanSchedules.loanId, id), eq(loanSchedules.tenantId, user.tenantId!));
          
      await tx.delete(loanSchedules).where(scheduleConditions);

      // 2. Delete the primary loan record
      await tx.delete(loans).where(conditions);
    });

    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'DELETE_LOAN',
      entityType: 'LOAN',
      entityId: id,
      details: { borrowerName: existing[0].borrowerName }
    });

    return NextResponse.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error: any) {
    console.error("DELETE LOAN ERROR:", error);
    return NextResponse.json({ error: 'Failed to delete loan', details: error.message }, { status: 500 });
  }
}
