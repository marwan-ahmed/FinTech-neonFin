import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants, users, loans, investors } from "@/schema/schema";
import { count, sum } from "drizzle-orm";
import { type TenantRow } from "../TenantsTable";
import TenantsControlPanel from "./TenantsControlPanel";
import { Building2 } from "lucide-react";

export default async function TenantsManagementPage() {
  const user = await getCurrentUser();

  // SECURITY: Block non-superadmin users
  if (!user || user.role !== 'superadmin') {
    notFound();
  }

  // ── Enriched Tenants List (using aggregates just like homepage) 
  const allTenantsList = await db.select().from(tenants);

  // Per-tenant metrics
  const usersPerTenant = await db
    .select({ tenantId: users.tenantId, count: count() })
    .from(users)
    .groupBy(users.tenantId);

  const loansPerTenant = await db
    .select({ tenantId: loans.tenantId, count: count() })
    .from(loans)
    .groupBy(loans.tenantId);

  const capitalPerTenant = await db
    .select({ tenantId: investors.tenantId, total: sum(investors.capital) })
    .from(investors)
    .groupBy(investors.tenantId);

  // Format data for component consumption
  const usersMap = new Map(usersPerTenant.map((r) => [r.tenantId, r.count]));
  const loansMap = new Map(loansPerTenant.map((r) => [r.tenantId, r.count]));
  const capitalMap = new Map(capitalPerTenant.map((r) => [r.tenantId, parseFloat(r.total || '0')]));

  const enrichedTenants: TenantRow[] = allTenantsList.map((t) => ({
    id: t.id,
    name: t.name,
    createdAt: t.createdAt.toISOString(),
    usersCount: usersMap.get(t.id) || 0,
    loansCount: loansMap.get(t.id) || 0,
    totalCapital: capitalMap.get(t.id) || 0,
    status: t.status,
    subscriptionStatus: t.subscriptionStatus,
    subscriptionEndDate: t.subscriptionEndDate ? t.subscriptionEndDate.toISOString() : null,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Main Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-1 text-xs text-[#737373] uppercase font-bold tracking-widest">
          <Building2 className="h-3 w-3 text-red-500" />
          <span>Infrastructure Registry</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Tenants Management</h1>
        <p className="text-[#a3a3a3] mt-2">Track, monitor, and provision SaaS space configurations across NeonFin.</p>
      </div>

      {/* Client wrapper control panel holding state */}
      <TenantsControlPanel enrichedTenants={enrichedTenants} />
    </div>
  );
}
