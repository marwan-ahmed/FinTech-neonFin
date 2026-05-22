import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycApplications } from '@/schema/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { tenantCondition } from '@/lib/tenant';
import { z } from 'zod';

const kycSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  type: z.string().min(2, "Type must be specified"),
  status: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
  riskLevel: z.enum(['low', 'medium', 'high']).optional().default('low'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conditions = tenantCondition(kycApplications.tenantId, user);

    const allKyc = await db.select().from(kycApplications)
      .where(conditions)
      .orderBy(desc(kycApplications.createdAt)).limit(limit).offset(offset);
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
    
    // 🔒 تسجيل إنشاء الطلب في سجلات التدقيق (Audit Logs)
    await logAudit({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'CREATE_KYC_APPLICATION',
      entityType: 'KYC_APPLICATION',
      entityId: result[0].id,
      details: { name: data.name, type: data.type, riskLevel: data.riskLevel }
    });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create KYC application' }, { status: 500 });
  }
}
