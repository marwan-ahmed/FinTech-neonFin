'use client';

import React, { useState, useMemo } from 'react';
import { Search, User, ChevronLeft, ChevronRight, Shield, Activity, Mail, Phone, Building2 } from 'lucide-react';

export interface GlobalUserRow {
  id: string;
  fullName: string | null;
  email: string | null;
  role: 'admin' | 'superadmin';
  phoneNumber: string | null;
  createdAt: string;
  tenantName: string | null;
  tenantId: string | null;
}

interface UsersTableProps {
  users: GlobalUserRow[];
}

const PAGE_SIZES = [10, 20, 50];

export default function UsersTable({ users }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Filter users based on Search and Role Filter ────────────────
  const filtered = useMemo(() => {
    return users.filter((u) => {
      // 1. Role check
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // 2. Keyword search check (names, emails, tenant names)
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchName = u.fullName?.toLowerCase().includes(q) || false;
      const matchEmail = u.email?.toLowerCase().includes(q) || false;
      const matchTenant = u.tenantName?.toLowerCase().includes(q) || false;
      const matchPhone = u.phoneNumber?.toLowerCase().includes(q) || false;

      return matchName || matchEmail || matchTenant || matchPhone;
    });
  }, [users, search, roleFilter]);

  // ── Pagination math ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg overflow-hidden animate-fade-in-up">
      
      {/* Toolbar / Header controls */}
      <div className="p-6 border-b border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141414]">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-[#a3a3a3]" />
            الحسابات المسجلة
          </h3>
          <p className="text-sm text-[#737373] mt-1">
            إدارة وصول المستخدمين عبر الفروع.
            <span className="text-[#a3a3a3] ml-1.5">({filtered.length} سجل فعال)</span>
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Role dropdown Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full xs:w-auto bg-[#0a0a0a] border border-[#262626] text-[#d4d4d4] text-sm rounded-md px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="all">جميع الصلاحيات</option>
            <option value="admin">مدراء الفروع (Admins)</option>
            <option value="superadmin">مدراء النظام (Super Admins)</option>
          </select>

          {/* Search bar */}
          <div className="relative w-full xs:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
            <input
              type="text"
              placeholder="ابحث عن مستخدم، بريد إلكتروني، أو فرع..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0a0a0a] border border-[#262626] text-white text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-[#525252]"
            />
          </div>
        </div>
      </div>

      {/* Rendered Users Grid/Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs uppercase bg-[#0a0a0a] text-[#737373] border-b border-[#262626]">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">الاسم / الهوية</th>
              <th className="px-6 py-4 font-semibold tracking-wider">الصلاحية</th>
              <th className="px-6 py-4 font-semibold tracking-wider">الفرع التابع له</th>
              <th className="px-6 py-4 font-semibold tracking-wider">رقم الهاتف</th>
              <th className="px-6 py-4 font-semibold tracking-wider">تاريخ الانضمام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626] text-[#d4d4d4]">
            {paginated.map((u) => (
              <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors group">
                {/* Column 1: User Identity */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#262626] to-[#1f1f1f] border border-[#404040] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-inner">
                      {(u.fullName || u.email || 'U').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{u.fullName || 'مستخدم نظام'}</p>
                      <p className="text-xs text-[#737373] flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="h-3 w-3 opacity-50 flex-shrink-0" />
                        {u.email || 'لم يتم إعداد بريد إلكتروني'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Column 2: Role */}
                <td className="px-6 py-4">
                  {u.role === 'superadmin' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-900/10 animate-pulse-subtle">
                      <Shield className="h-3 w-3" />
                      مدير نظام
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1a1a1a] text-[#a3a3a3] border border-[#262626]">
                      مدير فرع
                    </span>
                  )}
                </td>

                {/* Column 3: Tenant Identity */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-[#262626] flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-3 w-3 text-[#737373]" />
                    </div>
                    <span className="font-medium text-[#a3a3a3] truncate max-w-[160px]">
                      {u.tenantName || 'عقدة رئيسية معزولة'}
                    </span>
                  </div>
                </td>

                {/* Column 4: Phone */}
                <td className="px-6 py-4 font-mono text-xs text-[#737373]">
                  {u.phoneNumber ? (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 opacity-40" />
                      {u.phoneNumber}
                    </span>
                  ) : (
                    <span className="text-[#404040]">غير محدد</span>
                  )}
                </td>

                {/* Column 5: Date Registered */}
                <td className="px-6 py-4 font-mono text-xs text-[#a3a3a3]">
                  {new Date(u.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-[#737373] bg-[#0a0a0a]">
                  <Activity className="h-8 w-8 mx-auto mb-3 opacity-20 text-[#a3a3a3]" />
                  <p className="text-sm">{search || roleFilter !== 'all' ? 'لا توجد سجلات تطابق عوامل التصفية.' : 'لم يتم اكتشاف حسابات نظام مسجلة.'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Interactive Pagination Footer bar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#262626] bg-[#0a0a0a]">
          <div className="flex items-center gap-3 text-xs text-[#737373]">
            <span className="hidden xs:inline">الأسطر لكل صفحة:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-[#141414] border border-[#262626] text-[#d4d4d4] text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span>
              عرض {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} من {filtered.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#404040] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  p === safePage
                    ? 'bg-red-600 text-white'
                    : 'text-[#a3a3a3] hover:text-white hover:bg-[#262626]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded border border-[#262626] text-[#a3a3a3] hover:text-white hover:border-[#404040] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
