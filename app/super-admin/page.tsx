import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tenants, users, loans, investors } from "@/schema/schema";
import { count, sum } from "drizzle-orm";
import { Server, Users, Wallet, CreditCard, Activity, Search, ShieldCheck, Building2 } from "lucide-react";

export default async function SuperAdminPage() {
  const user = await getCurrentUser();

  // Protection: Only allow 'superadmin' to access this page
  // We use notFound() to hide the existence of this page from unauthorized users
  if (!user || user.role !== 'superadmin') {
    notFound();
  }

  // Fetch some quick stats for the Super Admin
  const [totalTenants] = await db.select({ count: count() }).from(tenants);
  const [totalUsers] = await db.select({ count: count() }).from(users);
  
  // Aggregate Financials
  const [totalLoansObj] = await db.select({ total: sum(loans.totalDebt) }).from(loans);
  const [totalCapitalObj] = await db.select({ total: sum(investors.capital) }).from(investors);
  
  const totalPlatformLoans = parseFloat(totalLoansObj.total || '0');
  const totalPlatformCapital = parseFloat(totalCapitalObj.total || '0');

  // Fetch the list of tenants to display
  const allTenantsList = await db.select().from(tenants);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-[#a3a3a3] mt-2">Comprehensive birds-eye view of your FinTech SaaS performance.</p>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-[#a3a3a3]">Active Organizations</h3>
            <Server className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-4xl font-bold text-white">{totalTenants.count}</p>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-[#a3a3a3]">Total Accounts</h3>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-4xl font-bold text-white">{totalUsers.count}</p>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-[#a3a3a3]">Platform Capital Managed</h3>
            <Wallet className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-4xl font-bold text-white">${totalPlatformCapital.toLocaleString()}</p>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-[#a3a3a3]">Platform Active Loans</h3>
            <CreditCard className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-4xl font-bold text-white">${totalPlatformLoans.toLocaleString()}</p>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Tenants List */}
      <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg overflow-hidden">
        <div className="p-6 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#a3a3a3]" />
              Organizations (Tenants)
            </h3>
            <p className="text-sm text-[#737373] mt-1">Full breakdown of registered SaaS spaces.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
            <input 
              type="text" 
              placeholder="Search tenants..." 
              className="bg-[#0a0a0a] border border-[#262626] text-white text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              disabled
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#0a0a0a] text-[#737373] border-b border-[#262626]">
              <tr>
                <th className="px-6 py-4 font-semibold">Tenant Name</th>
                <th className="px-6 py-4 font-semibold">Tenant ID</th>
                <th className="px-6 py-4 font-semibold">Creation Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626] text-[#d4d4d4]">
              {allTenantsList.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                     <div className="h-8 w-8 rounded bg-[#262626] flex items-center justify-center text-xs font-bold text-red-400">
                        {tenant.name.substring(0,2).toUpperCase()}
                     </div>
                     {tenant.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#737373]">{tenant.id}</td>
                  <td className="px-6 py-4 text-[#a3a3a3]">
                    {tenant.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Active
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-400 hover:text-red-300 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {allTenantsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#737373] bg-[#0a0a0a]">
                    <Activity className="h-8 w-8 mx-auto mb-3 opacity-20 text-[#a3a3a3]" />
                    <p>No tenants registered yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}