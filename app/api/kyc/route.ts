import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycApplications } from '@/schema/schema';
import { desc, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

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
