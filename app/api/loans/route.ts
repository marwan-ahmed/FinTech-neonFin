import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loans } from '@/schema/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const loanSchema = z.object({
  borrowerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional(),
  address: z.string().optional(),
  job: z.string().optional(),
  assetValue: z.number().or(z.string()).transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, "Asset value must be a positive number"),
  totalDebt: z.number().or(z.string()).transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, "Total debt must be a positive number"),
  tenure: z.number().int().positive("Tenure must be a positive integer"),
  marketCardValue: z.number().or(z.string()).optional().transform((val) => val ? Number(val) : undefined),
  saleCardValue: z.number().or(z.string()).optional().transform((val) => val ? Number(val) : undefined),
  score: z.string().optional().default('A'),
  status: z.enum(['pending', 'approved', 'active', 'completed', 'defaulted']).optional().default('active'),
  schedule: z.array(z.any()).optional().default([]), // More specific shape can be implemented later
  nextDue: z.string().or(z.date()).optional().transform((val) => val ? new Date(val) : null),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let query = db.select().from(loans);
    
    // If superadmin, return all. Otherwise return only tenant's loans.
    if (user.role !== 'superadmin') {
       query = query.where(eq(loans.tenantId, user.tenantId!)) as any;
    }
    
    const allLoans = await query.orderBy(desc(loans.createdAt));
    return NextResponse.json(allLoans);
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

    const result = await db.insert(loans).values({
      tenantId: user.tenantId,
      borrowerName: data.borrowerName,
      phone: data.phone || null,
      address: data.address || null,
      job: data.job || null,
      assetValue: data.assetValue.toString(),
      totalDebt: data.totalDebt.toString(),
      tenure: data.tenure,
      marketCardValue: data.marketCardValue?.toString() || null,
      saleCardValue: data.saleCardValue?.toString() || null,
      score: data.score,
      status: data.status,
      schedule: data.schedule,
      nextDue: data.nextDue,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
  }
}
