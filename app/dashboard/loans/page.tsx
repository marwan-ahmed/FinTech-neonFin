'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function getLoans() {
      try {
        const res = await fetch('/api/loans');
        if (res.ok) {
          const data = await res.json();
          setLoans(data.map((l: any) => ({
            ...l,
            borrowerId: l.borrowerName, // map for display
            assetValue: parseFloat(l.assetValue || 0),
            totalDebt: parseFloat(l.totalDebt || 0)
          })));
        }
      } catch (err) {
        console.error("Error fetching loans:", err);
      } finally {
        setLoading(false);
      }
    }
    getLoans();
  }, []);

  const filteredLoans = loans.filter(loan => 
    loan.borrowerId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">إدارة القروض</h2>
          <p className="text-sm text-[#737373] mt-1">تتبع وإدارة وسداد التسهيلات الائتمانية النشطة.</p>
        </div>
        <Link href="/dashboard/loans/apply" className="flex items-center gap-2 bg-[#10b981] text-black text-sm font-bold px-4 py-2 rounded hover:bg-[#34d399] transition-colors">
          <Plus size={16} />
          إضافة قرض جديد
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#262626] bg-[#141414]">
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#1a1a1a] p-4 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]" size={16} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded border border-[#262626] bg-[#0f0f0f] pr-10 pl-3 py-2 text-sm text-[#ededed] focus:border-[#10b981] outline-none"
              placeholder="ابحث برقم المقترض أو المعرف..."
            />
          </div>
          <button className="flex items-center gap-2 rounded border border-[#262626] bg-[#0f0f0f] px-4 py-2 text-sm text-[#ededed] hover:bg-[#262626] transition-colors">
            <Filter size={16} />
            فلترة
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-right">
            <thead className="sticky top-0 border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#737373] z-10">
              <tr>
                <th className="p-4 font-normal">المستفيد</th>
                <th className="p-4 font-normal">قيمة التسهيل</th>
                <th className="p-4 font-normal">المدة</th>
                <th className="p-4 font-normal">الاستحقاق</th>
                <th className="p-4 font-normal">الحالة</th>
                <th className="p-4 font-normal">إجراء</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#737373]">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin text-[#10b981]" />
                    </div>
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#737373]">لا توجد نتائج مطابقة.</td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-[#262626] transition-colors hover:bg-[#1a1a1a]">
                    <td className="p-4 text-white font-sans">{loan.borrowerId || 'غير محدد'}</td>
                    <td className="p-4 text-[#ededed]" dir="ltr">{(loan.assetValue || 0).toLocaleString()} د.ع</td>
                    <td className="p-4 text-[#737373]">{loan.tenure} شهر</td>
                    <td className="p-4 text-[#ededed]">{new Date(loan.nextDue).toLocaleDateString('ar-IQ')}</td>
                    <td className="p-4">
                      {loan.status === 'active' ? (
                        <span className="inline-flex items-center rounded-full bg-[#10b981]/10 px-2 py-1 text-xs font-medium text-[#10b981] ring-1 ring-inset ring-[#10b981]/20">
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#f59e0b]/10 px-2 py-1 text-xs font-medium text-[#f59e0b] ring-1 ring-inset ring-[#f59e0b]/20">
                          متأخر
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button className="text-xs text-[#10b981] underline hover:text-[#34d399]">إدارة</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
