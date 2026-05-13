import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/schema/schema';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const tenantCreateSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(100, "Organization name too long"),
});

export async function POST(req: Request) {
  try {
    // ── 1. Security Constraint Check ─────────────────────────────
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    // CRITICAL PRIME DIRECTIVE: Role verification must happen at DB level.
    if (currentUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin privileges required' }, { status: 403 });
    }

    // ── 2. Body Validation ─────────────────────────────────────────
    const body = await req.json();
    const parsed = tenantCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation Error', 
        details: parsed.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { name } = parsed.data;

    // ── 3. Database Insertion ──────────────────────────────────────
    const newTenant = await db.insert(tenants).values({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // ── 4. Audit Logging ───────────────────────────────────────────
    // Log global action on system-level. Since tenant is root, we attribute tenantId to new tenant.
    await logAudit({
      tenantId: newTenant[0].id,
      userId: currentUser.id,
      action: 'SYSTEM_CREATE_TENANT',
      entityType: 'TENANT',
      entityId: newTenant[0].id,
      details: {
        initiatedBy: currentUser.email,
        tenantName: name
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Tenant successfully onboarded', 
      tenant: newTenant[0] 
    }, { status: 201 });

  } catch (error: any) {
    console.error('[TENANT_CREATE_API_ERROR]', error);
    return NextResponse.json({ 
      error: 'Internal Platform Failure', 
      details: error.message 
    }, { status: 500 });
  }
}
