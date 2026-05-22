'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building2, Search, Activity, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Copy, Check, Clock, Ban, CheckCircle2 } from 'lucide-react';

export interface TenantRow {
  id: string;
  name: string;
  createdAt: string; // ISO string from server
  usersCount: number;
  loansCount: number;
  totalCapital: number;
  status: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
}

type SortKey = 'name' | 'createdAt' | 'usersCount' | 'loansCount' | 'totalCapital';
type SortDir = 'asc' | 'desc';

const PAGE_SIZES = [5, 10, 20];

export default function TenantsTable({ tenants }: { tenants: TenantRow[] }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return tenants;
    const q = search.toLowerCase();
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    );
  }, [tenants, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'usersCount':
          cmp = a.usersCount - b.usersCount;
          break;
        case 'loansCount':
          cmp = a.loansCount - b.loansCount;
          break;
        case 'totalCapital':
          cmp = a.totalCapital - b.totalCapital;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* fallback: ignore */ }
  }

  return (
    <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      {/* Header */}
      <div className="p-6 border-b border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141414]">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#a3a3a3]" />
            الفروع والحسابات
          </h3>
          <p className="text-sm text-[#737373] mt-1">
            عرض شامل لجميع مساحات العمل المسجلة. 
            <span className="text-[#a3a3a3] ml-1">({filtered.length} نتيجة)</span>
          </p>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
          <input
            type="text"
            placeholder="بحث بالاسم أو المعرف..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-64 bg-[#0a0a0a] border border-[#262626] text-white text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-[#525252]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-[#0a0a0a] text-[#737373] border-b border-[#262626]">
            <tr>
              <th className="px-6 py-4 font-semibold">
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  اسم الفرع <SortIcon col="name" activeKey={sortKey} direction={sortDir} />
                </button>
              </th>
              <th className="px-6 py-4 font-semibold">المعرف</th>
              <th className="px-6 py-4 font-semibold">
                <button onClick={() => toggleSort('usersCount')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  المستخدمين <SortIcon col="usersCount" activeKey={sortKey} direction={sortDir} />
                </button>
              </th>
              <th className="px-6 py-4 font-semibold">
                <button onClick={() => toggleSort('loansCount')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  القروض <SortIcon col="loansCount" activeKey={sortKey} direction={sortDir} />
                </button>
              </th>
              <th className="px-6 py-4 font-semibold">
                <button onClick={() => toggleSort('totalCapital')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  رأس المال <SortIcon col="totalCapital" activeKey={sortKey} direction={sortDir} />
                </button>
              </th>
              <th className="px-6 py-4 font-semibold">
                الحالة
              </th>
              <th className="px-6 py-4 font-semibold">
                <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  تاريخ التسجيل <SortIcon col="createdAt" activeKey={sortKey} direction={sortDir} />
                </button>
              </th>
              <th className="px-6 py-4 font-semibold text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626] text-[#d4d4d4]">
            {paginated.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-[#1a1a1a] transition-colors group/row">
                {/* Name */}
                <td className="px-6 py-4 font-medium text-white">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-red-600/30 to-red-800/50 border border-red-500/20 flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0">
                      {tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[180px]">{tenant.name}</span>
                  </div>
                </td>

                {/* ID — truncated with copy button */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#737373]">
                      {tenant.id.substring(0, 8)}...
                    </span>
                    <button
                      onClick={() => copyId(tenant.id)}
                      title="نسخ المعرف"
                      className="opacity-0 group-hover/row:opacity-100 transition-opacity text-[#525252] hover:text-white"
                    >
                      {copiedId === tenant.id ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Users Count */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {tenant.usersCount}
                  </span>
                </td>

                {/* Loans Count */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {tenant.loansCount}
                  </span>
                </td>

                {/* Capital */}
                <td className="px-6 py-4">
                  <div className="font-mono text-emerald-400">
                    {new Intl.NumberFormat('en-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(tenant.totalCapital)}
                  </div>
                </td>
                
                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1.5 items-start">
                    {tenant.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        معلق
                      </span>
                    ) : tenant.status === 'frozen' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        <Ban className="w-3.5 h-3.5" />
                        مجمد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        نشط
                      </span>
                    )}
                    
                    {tenant.subscriptionStatus === 'trial' && (
                      <span className="block mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-500 w-fit">
                        تجريبي
                      </span>
                    )}
                    {tenant.subscriptionStatus === 'active' && (
                      <span className="block mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500 w-fit">
                        اشتراك فعال
                      </span>
                    )}
                    {tenant.subscriptionStatus === 'expired' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 w-fit">
                        اشتراك منتهي
                      </span>
                    )}
                    
                    {tenant.subscriptionEndDate && (
                      <span className="text-[10px] text-[#737373] mt-0.5">
                        الانتهاء: {new Date(tenant.subscriptionEndDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 text-[#a3a3a3]">
                  {new Date(tenant.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/super-admin/tenants/${tenant.id}`}
                    className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                  >
                    إدارة
                  </Link>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#737373] bg-[#0a0a0a]">
                  <Activity className="h-8 w-8 mx-auto mb-3 opacity-20 text-[#a3a3a3]" />
                  <p>{search ? 'لا يوجد فروع تطابق بحثك.' : 'لا يوجد فروع مسجلة حتى الآن.'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#262626] bg-[#0a0a0a]">
          <div className="flex items-center gap-3 text-xs text-[#737373]">
            <span>صفوف بالصفحة:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-[#141414] border border-[#262626] text-[#d4d4d4] text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="hidden sm:inline">
              عرض {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} من {sorted.length}
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
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
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

function SortIcon({ col, activeKey, direction }: { col: SortKey; activeKey: SortKey; direction: SortDir }) {
  if (activeKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />;
  return direction === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5 text-red-400" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 text-red-400" />
  );
}
