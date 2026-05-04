import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditLogs, users } from '@/schema/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build the query
    const baseQuery = db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        userName: users.fullName,
        userEmail: users.email,
        tenantId: auditLogs.tenantId, // Superadmin can see which tenant
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id));

    // Role-based scoping
    const conditions = user.role === 'superadmin' 
      ? undefined 
      : eq(auditLogs.tenantId, user.tenantId!);

    const query = conditions 
      ? baseQuery.where(conditions) 
      : baseQuery;

    const logs = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
