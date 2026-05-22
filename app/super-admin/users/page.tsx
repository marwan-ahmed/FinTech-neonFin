import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users, tenants } from "@/schema/schema";
import { eq, desc } from "drizzle-orm";
import UsersTable, { type GlobalUserRow } from "./UsersTable";
import { Users, ShieldAlert, HardDrive } from "lucide-react";

export default async function GlobalUsersPage() {
  const user = await getCurrentUser();

  // SECURITY PRIME DIRECTIVE: Prevent layout-only bypassed access.
  if (!user || user.role !== 'superadmin') {
    notFound();
  }

  // ── Perform Database Aggregation (Join User Identity + Tenant Organization)
  const dbUsers = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      phoneNumber: users.phoneNumber,
      createdAt: users.createdAt,
      tenantName: tenants.name,
      tenantId: tenants.id,
    })
    .from(users)
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .orderBy(desc(users.createdAt));

  // Format dataset explicitly for serializable transport to Client Component
  const formattedUsers: GlobalUserRow[] = dbUsers.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role as 'admin' | 'superadmin',
    phoneNumber: u.phoneNumber,
    createdAt: u.createdAt.toISOString(),
    tenantName: u.tenantName,
    tenantId: u.tenantId,
  }));

  // Calculate summary count markers
  const totalAdmins = formattedUsers.filter(u => u.role === 'admin').length;
  const totalSuperAdmins = formattedUsers.filter(u => u.role === 'superadmin').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Section Header Title */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-1 text-xs text-[#737373] uppercase font-bold tracking-widest">
          <HardDrive className="h-3 w-3 text-red-500" />
          <span>بيانات عضوية المنصة</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">جميع الحسابات</h1>
        <p className="text-[#a3a3a3] mt-2">نظرة عامة شاملة على جميع الحسابات والهويات الأمنية المسجلة حالياً.</p>
      </div>

      {/* Summary Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
        {/* Card 1: Total users */}
        <div className="p-5 rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-md">
          <div className="flex items-center justify-between text-[#737373] text-xs uppercase font-bold mb-2">
            <span>إجمالي الحسابات بالنظام</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{formattedUsers.length}</p>
        </div>

        {/* Card 2: Super admins */}
        <div className="p-5 rounded-xl border border-red-900/20 bg-[#0f0f0f] shadow-md">
          <div className="flex items-center justify-between text-[#737373] text-xs uppercase font-bold mb-2">
            <span>مدراء النظام (Super Admins)</span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-3xl font-extrabold text-red-400">{totalSuperAdmins}</p>
        </div>

        {/* Card 3: Regular Admins */}
        <div className="p-5 rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-md">
          <div className="flex items-center justify-between text-[#737373] text-xs uppercase font-bold mb-2">
            <span>مدراء الفروع (Admins)</span>
            <Users className="h-4 w-4 text-[#a3a3a3]" />
          </div>
          <p className="text-3xl font-extrabold text-[#d4d4d4]">{totalAdmins}</p>
        </div>
      </div>

      {/* Core Data Render Container */}
      <UsersTable users={formattedUsers} />
    </div>
  );
}
