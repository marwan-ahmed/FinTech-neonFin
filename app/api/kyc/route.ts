import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kycApplications } from '@/schema/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allKyc = await db.select().from(kycApplications).orderBy(desc(kycApplications.createdAt));
    return NextResponse.json(allKyc);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch KYC applications' }, { status: 500 });
  }
}
