import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans, loanSchedules, cardBatches, tenants } from '@/schema/schema';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { tenantCondition } from '@/lib/tenant';
import { z } from 'zod';

const loanSchema = z.object({
  borrowerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  job: z.string().optional().nullable(),
  assetValue: z.number().or(z.string()).transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, "Asset value must be a positive number"),
  totalDebt: z.number().or(z.string()).transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, "Total debt must be a positive number"),
  tenure: z.number().int().positive("Tenure must be a positive integer"),
  marketCardValue: z.number().or(z.string()).optional().transform((val) => val ? Number(val) : undefined),
  saleCardValue: z.number().or(z.string()).optional().transform((val) => val ? Number(val) : undefined),
  score: z.string().optional().default('A'),
  status: z.enum(['pending', 'approved', 'active', 'completed', 'defaulted']).optional().default('active'),
  disbursementType: z.enum(['cash', 'cards']).optional().default('cash'),
  cardBatchId: z.string().uuid().optional().nullable(),
  cardsAllocated: z.number().int().nonnegative().optional().default(0),
  cardWholesalePrice: z.number().optional().nullable(),
  schedule: z.array(z.object({
    installmentNumber: z.number().int().optional(),
    dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
    amount: z.number().or(z.string()).transform((val) => Number(val))
  })).optional().default([]),
  nextDue: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : null),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let query = db.select().from(loans);
    
    const tCond = tenantCondition(loans.tenantId, user);
    if (tCond) {
       query = query.where(tCond) as any;
    }
    
    const allLoans = await query.orderBy(desc(loans.createdAt)).limit(limit).offset(offset);
    
    if (allLoans.length > 0) {
      const loanIds = allLoans.map(l => l.id);
      
      // Batch fetch all schedules for the loaded loans using index
      const allSchedules = await db.select()
        .from(loanSchedules)
        .where(inArray(loanSchedules.loanId, loanIds))
        .orderBy(loanSchedules.installmentNumber);
        
      // Group schedules by loanId in O(N) time complexity
      const schedulesByLoanId = allSchedules.reduce((acc, sch) => {
        if (!acc[sch.loanId]) acc[sch.loanId] = [];
        acc[sch.loanId].push(sch);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Attach mapped schedules directly to response objects
      const loansWithSchedules = allLoans.map(l => ({
        ...l,
        schedule: schedulesByLoanId[l.id] || []
      }));
      
      return NextResponse.json(loansWithSchedules);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rawData = await req.json();
    
    // Validate input using Zod
    const validationResult = loanSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validations failed', details: validationResult.error.format() }, { status: 400 });
    }
    const data = validationResult.data;

    // Fetch tenant to check trial limits
    const tenantObj = await db.query.tenants.findFirst({ where: eq(tenants.id, user.tenantId!) });
    if (tenantObj?.subscriptionStatus === 'trial') {
      const [loansCount] = await db.select({ count: sql<number>`count(*)` }).from(loans).where(eq(loans.tenantId, user.tenantId!));
      if (loansCount.count >= 1) {
        return NextResponse.json({ error: 'عذراً، لا يمكن إضافة أكثر من قرض واحد في الفترة التجريبية. يرجى الترقية.' }, { status: 403 });
      }
    }

    // 🔒 3.2: استخدام المعاملات (Database Transactions) لمنع تفتت البيانات وضمان متانة الإدخال
    const result = await db.transaction(async (tx) => {
      const res = await tx.insert(loans).values({
        tenantId: user.tenantId!,
        borrowerName: data.borrowerName,
        phone: data.phone || null,
        address: data.address || null,
        job: data.job || null,
        assetValue: parseFloat(data.assetValue.toString()).toFixed(2),
        totalDebt: parseFloat(data.totalDebt.toString()).toFixed(2),
        tenure: data.tenure,
        marketCardValue: data.marketCardValue ? parseFloat(data.marketCardValue.toString()).toFixed(2) : null,
        saleCardValue: data.saleCardValue ? parseFloat(data.saleCardValue.toString()).toFixed(2) : null,
        disbursementType: data.disbursementType,
        cardBatchId: data.cardBatchId,
        cardsAllocated: data.cardsAllocated,
        cardWholesalePrice: data.cardWholesalePrice ? parseFloat(data.cardWholesalePrice.toString()).toFixed(2) : null,
        score: data.score,
        status: data.status,
        nextDue: data.nextDue,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // If card loan, deduct from batch inventory
      if (data.disbursementType === 'cards' && data.cardBatchId && data.cardsAllocated > 0) {
        const [batch] = await tx.select()
          .from(cardBatches)
          .where(eq(cardBatches.id, data.cardBatchId))
          .limit(1);
        
        if (!batch) {
          throw new Error("وجبة البطاقات المحددة غير موجودة.");
        }
        if (batch.remainingQuantity < data.cardsAllocated) {
          throw new Error(`الكمية المطلوبة (${data.cardsAllocated}) غير متوفرة في المخزن (المتبقي: ${batch.remainingQuantity}).`);
        }
        
        await tx.update(cardBatches)
          .set({
            remainingQuantity: batch.remainingQuantity - data.cardsAllocated,
            updatedAt: new Date()
          })
          .where(eq(cardBatches.id, data.cardBatchId));
      }
      
      // إدراج جدول الأقساط بشكل متزامن داخل المعاملة
      if (data.schedule && data.schedule.length > 0) {
        await tx.insert(loanSchedules).values(
          data.schedule.map((sch: any, idx: number) => ({
            tenantId: user.tenantId!,
            loanId: res[0].id,
            installmentNumber: sch.installmentNumber || idx + 1,
            dueDate: sch.dueDate,
            amount: parseFloat(sch.amount).toFixed(2),
            paidAmount: '0',
            status: 'pending' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          }))
        );
      }

      return res;
    });
    
    // تسجيل المعاملة في مركز المراقبة
    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'CREATE_LOAN',
      entityType: 'LOAN',
      entityId: result[0].id,
      details: { borrowerName: data.borrowerName, assetValue: data.assetValue, totalDebt: data.totalDebt }
    });

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("LOAN CREATE ERROR:", error, error.stack);
    return NextResponse.json({ error: 'Failed to create loan', details: error.message, code: error.code, detail: error.detail }, { status: 500 });
  }
}
