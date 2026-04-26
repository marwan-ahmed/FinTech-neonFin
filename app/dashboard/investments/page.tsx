'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function InvestmentsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInvestors() {
      try {
        const res = await fetch('/api/investors');
        if (res.ok) {
          const data = await res.json();
          setInvestors(data.map((i: any) => ({
            ...i,
            capital: parseFloat(i.capital || 0)
          })));
        }
      } catch (err) {
        console.error("Error fetching investors:", err);
      } finally {
        setLoading(false);
      }
    }
    getInvestors();
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">محافظ الاستثمار</h2>
          <p className="text-sm text-[#737373] mt-1">تتبع التدفقات النقدية والمستثمرين المسجلين.</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#262626] bg-[#141414]">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-right">
            <thead className="sticky top-0 border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#737373] z-10">
              <tr>
                <th className="p-4 font-normal">المستثمر</th>
                <th className="p-4 font-normal">نوع المستثمر</th>
                <th className="p-4 font-normal">رأس المال المُودع (دينار)</th>
                <th className="p-4 font-normal">تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#737373]">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin text-[#10b981]" />
                    </div>
                  </td>
                </tr>
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#737373]">لا يوجد مستثمرين بعد.</td>
                </tr>
              ) : (
                investors.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#262626] transition-colors hover:bg-[#1a1a1a]">
                    <td className="p-4 text-white font-sans">{inv.name || 'بدون اسم'}</td>
                    <td className="p-4 text-[#737373]">{inv.type === 'institutional' ? 'مؤسسي' : 'أفراد'}</td>
                    <td className="p-4 text-[#ededed]" dir="ltr">{(inv.capital || 0).toLocaleString()} د.ع</td>
                    <td className="p-4 text-[#ededed]">
                       {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-IQ') : '-'}
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
