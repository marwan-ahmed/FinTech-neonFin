import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants, users, loans, investors, kycApplications, auditLogs } from "@/schema/schema";
import { count, sum, eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import {
  ArrowLeft, Users, CreditCard, Wallet, FileCheck, Activity, Calendar,
  TrendingUp, AlertTriangle, ShieldCheck
} from "lucide-react";
import TenantStatusToggle from "./TenantStatusToggle";
import TenantSubscriptionControls from "./TenantSubscriptionControls";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== 'superadmin') {
    notFound();
  }

  // Fetch tenant
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, id),
  });

  if (!tenant) {
    notFound();
  }

  // Fetch stats for this tenant
  const [tenantUsersCount] = await db.select({ count: count() }).from(users).where(eq(users.tenantId, id));
  const [tenantLoansCount] = await db.select({ count: count() }).from(loans).where(eq(loans.tenantId, id));
  const [tenantCapitalObj] = await db.select({ total: sum(investors.capital) }).from(investors).where(eq(investors.tenantId, id));
  const [tenantLoanValueObj] = await db.select({ total: sum(loans.totalDebt) }).from(loans).where(eq(loans.tenantId, id));
  const [tenantDefaultedCount] = await db.select({ count: count() }).from(loans).where(and(eq(loans.tenantId, id), eq(loans.status, 'defaulted')));
  const [tenantPendingKyc] = await db.select({ count: count() }).from(kycApplications).where(and(eq(kycApplications.tenantId, id), eq(kycApplications.status, 'pending')));

  const capital = parseFloat(tenantCapitalObj.total || '0');
  const loanValue = parseFloat(tenantLoanValueObj.total || '0');
  const defaultRate = tenantLoansCount.count > 0
    ? ((tenantDefaultedCount.count / tenantLoansCount.count) * 100).toFixed(1)
    : '0.0';

  // Recent audit logs
  const recentLogs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.tenantId, id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  // Recent users
  const tenantUsers = await db
    .select()
    .from(users)
    .where(eq(users.tenantId, id))
    .orderBy(desc(users.createdAt))
    .limit(10);

  // Stats cards data
  const stats = [
    { title: 'Users', value: tenantUsersCount.count, icon: Users, color: 'purple' },
    { title: 'Active Loans', value: tenantLoansCount.count, icon: CreditCard, color: 'orange' },
    { title: 'Capital Managed', value: `$${capital.toLocaleString()}`, icon: Wallet, color: 'green' },
    { title: 'Loan Portfolio', value: `$${loanValue.toLocaleString()}`, icon: TrendingUp, color: 'blue' },
    { title: 'Default Rate', value: `${defaultRate}%`, icon: AlertTriangle, color: parseFloat(defaultRate) > 5 ? 'red' : 'emerald' },
    { title: 'Pending KYC', value: tenantPendingKyc.count, icon: FileCheck, color: tenantPendingKyc.count > 0 ? 'yellow' : 'emerald' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb + Header */}
      <div className="animate-fade-in">
        <Link
          href="/super-admin"
          className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Platform Overview
        </Link>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-600/30 to-red-800/50 border border-red-500/20 flex items-center justify-center text-lg font-bold text-red-400">
            {tenant.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{tenant.name}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                tenant.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 
                tenant.status === 'frozen' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {tenant.status === 'active' ? 'نشط' : tenant.status === 'frozen' ? 'مجمد' : 'قيد المراجعة'}
              </span>
            </div>
            <p className="text-[#737373] text-sm mt-1 flex items-center gap-3">
              <span className="font-mono">{tenant.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Registered {tenant.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-blue-500" />
              Security & Access
            </h3>
            <p className="text-[#a3a3a3] text-sm mb-6">
              Control platform access for this specific organization. Frozen organizations cannot login or access APIs.
            </p>
            <TenantStatusToggle tenantId={tenant.id} initialStatus={tenant.status} />
          </div>

          <TenantSubscriptionControls 
            tenantId={tenant.id} 
            status={tenant.status}
            subscriptionStatus={tenant.subscriptionStatus}
            subscriptionEndDate={tenant.subscriptionEndDate ? tenant.subscriptionEndDate.toISOString() : null}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-5 grid-cols-2 lg:grid-cols-3 stagger-children">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color] || colorMap.blue;
          return (
            <div key={stat.title} className={`rounded-xl border ${colors.border} bg-[#0f0f0f] shadow-lg p-5 relative overflow-hidden group hover:border-[#404040] transition-all duration-300`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-xs text-[#a3a3a3] uppercase tracking-wider">{stat.title}</h3>
                <div className={`h-8 w-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Two Columns: Users + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant Users */}
        <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="p-5 border-b border-[#262626] bg-[#141414]">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              Users
              <span className="text-xs text-[#737373] ml-auto">{tenantUsersCount.count} total</span>
            </h3>
          </div>
          <div className="divide-y divide-[#262626]">
            {tenantUsers.length === 0 ? (
              <div className="p-8 text-center text-[#737373]">
                <Users className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No users found.</p>
              </div>
            ) : (
              tenantUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1a1a1a] transition-colors">
                  <div className="h-8 w-8 rounded-full bg-[#262626] flex items-center justify-center text-xs font-bold text-[#a3a3a3]">
                    {(u.fullName || u.email || '??').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.fullName || 'Unnamed'}</p>
                    <p className="text-xs text-[#737373] truncate">{u.email || '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    u.role === 'superadmin'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity / Audit Logs */}
        <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="p-5 border-b border-[#262626] bg-[#141414]">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              Recent Activity
              <span className="text-xs text-[#737373] ml-auto">Last 10</span>
            </h3>
          </div>
          <div className="divide-y divide-[#262626] max-h-[400px] overflow-y-auto">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-[#737373]">
                <Activity className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity recorded yet.</p>
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="px-5 py-3 hover:bg-[#1a1a1a] transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-[#737373]"> on </span>
                      <span className="text-[#a3a3a3]">{log.entityType}</span>
                    </p>
                    <span className="text-xs text-[#525252] flex-shrink-0 ml-3">
                      {log.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#525252] mt-0.5 font-mono">{log.entityId.substring(0, 8)}...</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
