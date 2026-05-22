import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants, users, loans, investors, kycApplications } from "@/schema/schema";
import { count, sum, eq, sql } from "drizzle-orm";
import { Server, Users, Wallet, CreditCard, AlertTriangle, TrendingUp, ShieldCheck, FileCheck } from "lucide-react";
import TenantsTable, { type TenantRow } from "./TenantsTable";
import PlatformCharts from "./PlatformCharts";

export default async function SuperAdminPage() {
  const user = await getCurrentUser();

  // Protection: Only allow 'superadmin' to access this page
  // We use notFound() to hide the existence of this page from unauthorized users
  if (!user || user.role !== 'superadmin') {
    notFound();
  }

  // ── Aggregate Platform Stats ──────────────────────────────────
  const [totalTenants] = await db.select({ count: count() }).from(tenants);
  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalLoansObj] = await db.select({ total: sum(loans.totalDebt) }).from(loans);
  const [totalCapitalObj] = await db.select({ total: sum(investors.capital) }).from(investors);
  const [totalLoansCount] = await db.select({ count: count() }).from(loans);
  const [defaultedLoansCount] = await db.select({ count: count() }).from(loans).where(eq(loans.status, 'defaulted'));
  const [pendingKycCount] = await db.select({ count: count() }).from(kycApplications).where(eq(kycApplications.status, 'pending'));

  const totalPlatformLoans = parseFloat(totalLoansObj.total || '0');
  const totalPlatformCapital = parseFloat(totalCapitalObj.total || '0');
  const defaultRate = totalLoansCount.count > 0
    ? ((defaultedLoansCount.count / totalLoansCount.count) * 100).toFixed(1)
    : '0.0';

  // ── Fetch Growth Data (Cumulative Organizations Onboarded) ──
  // Groups counts of tenants by Year-Month format using Postgres to_char
  const monthlyRegistrations = await db
    .select({
      month: sql<string>`TO_CHAR(${tenants.createdAt}, 'YYYY-MM')`,
      count: count(),
    })
    .from(tenants)
    .groupBy(sql`TO_CHAR(${tenants.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${tenants.createdAt}, 'YYYY-MM')`);

  const growthData = monthlyRegistrations.map((row) => ({
    month: row.month,
    organizations: row.count,
  }));

  // ── Enriched Tenants List (with per-tenant stats) ─────────────
  const allTenantsList = await db.select().from(tenants);

  // Per-tenant users count
  const usersPerTenant = await db
    .select({ tenantId: users.tenantId, count: count() })
    .from(users)
    .groupBy(users.tenantId);

  // Per-tenant loans count
  const loansPerTenant = await db
    .select({ tenantId: loans.tenantId, count: count() })
    .from(loans)
    .groupBy(loans.tenantId);

  // Per-tenant capital
  const capitalPerTenant = await db
    .select({ tenantId: investors.tenantId, total: sum(investors.capital) })
    .from(investors)
    .groupBy(investors.tenantId);

  // Build lookup maps
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

  // Build Chart Distribution Data (from the mapped list)
  const distributionData = enrichedTenants.map((t) => ({
    name: t.name,
    loansCount: t.loansCount,
    totalCapital: t.totalCapital,
  }));

  // ── Stats Card Data ───────────────────────────────────────────
  const statsCards = [
    {
      title: 'Active Organizations',
      value: totalTenants.count.toString(),
      icon: Server,
      color: 'blue',
      gradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-500',
      valuePrefix: '',
    },
    {
      title: 'Total Accounts',
      value: totalUsers.count.toString(),
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-500',
      valuePrefix: '',
    },
    {
      title: 'Platform Capital',
      value: totalPlatformCapital.toLocaleString(),
      icon: Wallet,
      color: 'green',
      gradient: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-500/20',
      iconColor: 'text-green-500',
      valuePrefix: '$',
    },
    {
      title: 'Active Loans Value',
      value: totalPlatformLoans.toLocaleString(),
      icon: CreditCard,
      color: 'orange',
      gradient: 'from-orange-500/10 to-orange-600/5',
      borderColor: 'border-orange-500/20',
      iconColor: 'text-orange-500',
      valuePrefix: '$',
    },
    {
      title: 'Default Rate',
      value: `${defaultRate}%`,
      icon: AlertTriangle,
      color: parseFloat(defaultRate) > 5 ? 'red' : 'emerald',
      gradient: parseFloat(defaultRate) > 5 ? 'from-red-500/10 to-red-600/5' : 'from-emerald-500/10 to-emerald-600/5',
      borderColor: parseFloat(defaultRate) > 5 ? 'border-red-500/20' : 'border-emerald-500/20',
      iconColor: parseFloat(defaultRate) > 5 ? 'text-red-500' : 'text-emerald-500',
      valuePrefix: '',
    },
    {
      title: 'Pending KYC',
      value: pendingKycCount.count.toString(),
      icon: FileCheck,
      color: pendingKycCount.count > 0 ? 'yellow' : 'emerald',
      gradient: pendingKycCount.count > 0 ? 'from-yellow-500/10 to-yellow-600/5' : 'from-emerald-500/10 to-emerald-600/5',
      borderColor: pendingKycCount.count > 0 ? 'border-yellow-500/20' : 'border-emerald-500/20',
      iconColor: pendingKycCount.count > 0 ? 'text-yellow-500' : 'text-emerald-500',
      valuePrefix: '',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-[#a3a3a3] mt-2">Comprehensive birds-eye view of your FinTech SaaS performance.</p>
      </div>
      
      {/* Stats Grid — 6 cards in 3x2 grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3 stagger-children">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`rounded-xl border ${card.borderColor} bg-[#0f0f0f] shadow-lg p-5 lg:p-6 relative overflow-hidden group hover:border-[#404040] transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-xs lg:text-sm text-[#a3a3a3] uppercase tracking-wider">{card.title}</h3>
                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-white">
                {card.valuePrefix}{card.value}
              </p>
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            </div>
          );
        })}
      </div>

      {/* Charts Section — Side-by-side layout */}
      <PlatformCharts growthData={growthData} distributionData={distributionData} />

      {/* Tenants Table — interactive client component */}
      <TenantsTable tenants={enrichedTenants} />
    </div>
  );
}