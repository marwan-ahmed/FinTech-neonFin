import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycApplications } from '@/schema/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const kycSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  type: z.string().min(2, "Type must be specified"),
  status: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
  riskLevel: z.enum(['low', 'medium', 'high']).optional().default('low'),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let query = db.select().from(kycApplications);

    // If superadmin, return all. Otherwise return only tenant's applications.
    if (user.role !== 'superadmin') {
       query = query.where(eq(kycApplications.tenantId, user.tenantId!)) as any;
    }

    const allKyc = await query.orderBy(desc(kycApplications.createdAt));
    return NextResponse.json(allKyc);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch KYC applications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rawData = await req.json();
    
    // Validate input using Zod
    const validationResult = kycSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validations failed', details: validationResult.error.format() }, { status: 400 });
    }
    
    const data = validationResult.data;

    const result = await db.insert(kycApplications).values({
      tenantId: user.tenantId,
      name: data.name,
      type: data.type,
      status: data.status,
      riskLevel: data.riskLevel,
      createdAt: new Date(),
    }).returning();
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create KYC application' }, { status: 500 });
  }
}
