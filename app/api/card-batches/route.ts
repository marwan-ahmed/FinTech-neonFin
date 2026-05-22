import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cardBatches, investors, tenants } from '@/schema/schema';
import { desc, eq, sum, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { tenantCondition } from '@/lib/tenant';
import { z } from 'zod';

const cardBatchSchema = z.object({
  batchName: z.string().min(2, "Name must be at least 2 characters").max(100),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  wholesalePrice: z.number().positive("Wholesale price must be a positive number"),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.tenantId && user.role !== 'superadmin')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = tenantCondition(cardBatches.tenantId, user);

    const batches = await db.select({
      id: cardBatches.id,
      tenantId: cardBatches.tenantId,
      batchName: cardBatches.batchName,
      quantity: cardBatches.quantity,
      remainingQuantity: cardBatches.remainingQuantity,
      wholesalePrice: cardBatches.wholesalePrice,
      totalCost: cardBatches.totalCost,
      createdAt: cardBatches.createdAt,
      updatedAt: cardBatches.updatedAt,
      tenantName: tenants.name,
    })
      .from(cardBatches)
      .leftJoin(tenants, eq(cardBatches.tenantId, tenants.id))
      .where(conditions)
      .orderBy(desc(cardBatches.createdAt));

    return NextResponse.json(batches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch card batches' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rawData = await req.json();
    
    // Validate input using Zod
    const validationResult = cardBatchSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validations failed', details: validationResult.error.format() }, { status: 400 });
    }
    
    const data = validationResult.data;

    // Check if tenant is on trial and enforce 100 cards limit
    const tenantObj = await db.query.tenants.findFirst({ where: eq(tenants.id, user.tenantId!) });
    if (tenantObj?.subscriptionStatus === 'trial') {
      const [cardsSum] = await db.select({ total: sql<number>`sum(${cardBatches.quantity})` }).from(cardBatches).where(eq(cardBatches.tenantId, user.tenantId!));
      const currentTotal = Number(cardsSum.total || 0);
      if (currentTotal + Number(data.quantity) > 100) {
        return NextResponse.json({ error: 'عذراً، لا يمكن إضافة أكثر من 100 بطاقة إجمالاً في الفترة التجريبية. يرجى الترقية.' }, { status: 403 });
      }
    }

    const totalCost = data.quantity * data.wholesalePrice;

    // Check if there is enough liquid capital before purchasing
    // Liquid capital = Total Investor Capital - Total Card Batches Purchased - Total Cash Loans
    const [totalCapitalObj] = await db.select({ total: sum(investors.capital) })
      .from(investors)
      .where(eq(investors.tenantId, user.tenantId));
    
    const [totalBatchesCostObj] = await db.select({ total: sum(cardBatches.totalCost) })
      .from(cardBatches)
      .where(eq(cardBatches.tenantId, user.tenantId));

    const totalCapital = parseFloat(totalCapitalObj?.total || '0');
    const totalBatchesCost = parseFloat(totalBatchesCostObj?.total || '0');
    
    // Let's also fetch total cash loans disbursed (if we want strict check)
    // For now we will allow it or check simple liquid check:
    const availableLiquid = totalCapital - totalBatchesCost;
    if (availableLiquid < totalCost) {
      return NextResponse.json({ 
        error: 'عذراً، رأس المال السائل المتبقي غير كافٍ لإتمام عملية الشراء.',
        available: availableLiquid,
        required: totalCost
      }, { status: 400 });
    }

    const result = await db.insert(cardBatches).values({
      tenantId: user.tenantId,
      batchName: data.batchName,
      quantity: data.quantity,
      remainingQuantity: data.quantity,
      wholesalePrice: data.wholesalePrice.toString(),
      totalCost: totalCost.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Audit log
    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'BUY_CARD_BATCH',
      entityType: 'CARD_BATCH',
      entityId: result[0].id,
      details: { 
        batchName: data.batchName, 
        quantity: data.quantity, 
        wholesalePrice: data.wholesalePrice,
        totalCost: totalCost
      }
    });
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create card batch' }, { status: 500 });
  }
}
