'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';

export default function DashboardClient() {
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvestorModal, setShowInvestorModal] = useState(false);

  // Modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investorName, setInvestorName] = useState('');
  const [investorCapital, setInvestorCapital] = useState('');
  const [investorType, setInvestorType] = useState('retail');

  const fetchData = async () => {
    try {
      const [loansRes, investorsRes] = await Promise.all([
        fetch('/api/loans'),
        fetch('/api/investors')
      ]);
      if (loansRes.ok) {
         const loansData = await loansRes.json();
         // Parse decimal strings back to number for client usage
         setLoans(loansData.map((l: any) => ({
           ...l,
           assetValue: parseFloat(l.assetValue || 0),
           totalDebt: parseFloat(l.totalDebt || 0)
         })));
      }
      if (investorsRes.ok) {
         const invData = await investorsRes.json();
         setInvestors(invData.map((i: any) => ({
           ...i,
           capital: parseFloat(i.capital || 0)
         })));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/investors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: investorName,
          capital: Number(investorCapital),
          type: investorType
        })
      });
      if (!res.ok) throw new Error('Failed to add investor');
      
      setShowInvestorModal(false);
      setInvestorName('');
      setInvestorCapital('');
      setInvestorType('retail');
      fetchData(); // Refresh data
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الإضافة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalInvestorsCapital = investors.reduce((acc, inv) => acc + (inv.capital || 0), 0);
  const activeDisbursements = loans.reduce((acc, loan) => acc + (loan.assetValue || 0), 0);
  
  const institutionalCapital = investors.filter(i => i.type === 'institutional').reduce((a, b) => a + (b.capital || 0), 0);
  const retailCapital = investors.filter(i => i.type === 'retail').reduce((a, b) => a + (b.capital || 0), 0);
  
  const instPercent = totalInvestorsCapital > 0 ? Math.round((institutionalCapital / totalInvestorsCapital) * 100) : 0;
  const retailPercent = totalInvestorsCapital > 0 ? 100 - instPercent : 0;

  return (
    <div className="grid h-full grid-cols-12 gap-6 pb-10 relative">
      {/* Modals */}
      {showInvestorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#262626] bg-[#141414] p-6 relative">
            <button onClick={() => setShowInvestorModal(false)} className="absolute top-4 left-4 text-[#737373] hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">إضافة مستثمر جديد</h2>
            <form onSubmit={handleAddInvestor} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">اسم المستثمر / المؤسسة</label>
                <input required value={investorName} onChange={e => setInvestorName(e.target.value)} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none" placeholder="مثال: شركة الأفق" />
              </div>
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">نوع المستثمر</label>
                <select value={investorType} onChange={e => setInvestorType(e.target.value)} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none dir-rtl">
                  <option value="retail">أفراد / صغار</option>
                  <option value="institutional">مؤسسات</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">رأس المال المستثمر (دينار)</label>
                <input required type="number" dir="ltr" value={investorCapital} onChange={e => setInvestorCapital(e.target.value)} className="w-full bg-[#0f0f0f] text-left border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none" placeholder="5000000" />
              </div>
              <button disabled={isSubmitting} type="submit" className="mt-4 w-full bg-[#ededed] text-black font-bold py-3 rounded hover:bg-white transition-colors flex justify-center items-center">
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'تأكيد الإضافة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Left Column: KPI Metrics */}
      <section className="col-span-12 flex flex-col gap-6 lg:col-span-3">
        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5 relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373]">إجمالي رأس المال</span>
          <h2 className="font-mono text-3xl tracking-tighter text-[#ededed]" dir="ltr">
            {totalInvestorsCapital.toLocaleString('en-US')} د.ع
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#737373]"></span>
            <span className="text-[11px] text-[#737373]">نمو 0.0%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373]">المدفوعات النشطة</span>
          <h2 className="font-mono text-3xl tracking-tighter text-[#ededed]" dir="ltr">
            {activeDisbursements.toLocaleString('en-US')} د.ع
          </h2>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#262626]">
             <div className="h-full bg-[#10b981]" style={{ width: `${totalInvestorsCapital > 0 ? Math.min(100, (activeDisbursements / totalInvestorsCapital) * 100) : 0}%` }}></div>
          </div>
          <span className="mt-1 text-[10px] text-[#737373]">معدل الاستخدام {totalInvestorsCapital > 0 ? Math.round((activeDisbursements / totalInvestorsCapital) * 100) : 0}%</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373]">مؤشر التعرض للمخاطر</span>
          <h2 className="font-mono text-3xl tracking-tighter text-[#737373]">0.00%</h2>
          <p className="mt-2 text-[11px] italic text-[#737373]">بانتظار بيانات كافية للحساب</p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <button onClick={() => router.push('/dashboard/loans/apply')} className="flex justify-center items-center gap-2 w-full rounded bg-[#10b981] py-4 text-sm font-bold text-black transition-colors hover:bg-[#34d399]">
            <Plus size={18} />
            تسهيلات ائتمانية جديدة
          </button>
          <button onClick={() => setShowInvestorModal(true)} className="flex justify-center items-center gap-2 w-full rounded border border-[#262626] bg-[#1a1a1a] py-4 text-sm font-bold text-white transition-colors hover:bg-[#262626]">
            <Plus size={18} />
            إضافة مستثمر
          </button>
        </div>
      </section>

      {/* Middle Column: Main Table */}
      <section className="col-span-12 flex flex-col overflow-hidden rounded-lg border border-[#262626] bg-[#141414] lg:col-span-6">
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#1a1a1a] p-5">
          <h3 className="text-sm font-bold tracking-tight uppercase text-[#ededed]">محفظة القروض النشطة</h3>
          <span className="font-mono text-[10px] text-[#737373]">تحديث فوري للبيانات</span>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#737373]">
              <tr>
                <th className="p-4 font-normal">المقترض</th>
                <th className="p-4 font-normal">قيمة الأصل</th>
                <th className="p-4 font-normal">المدة</th>
                <th className="p-4 font-normal">الاستحقاق القادم</th>
                <th className="p-4 font-normal">التصنيف</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#737373]">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin text-[#10b981]" />
                    </div>
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#737373]">لا توجد قروض مسجلة بعد.</td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id} className="cursor-pointer border-b border-[#262626] transition-colors hover:bg-[#1a1a1a]">
                    <td className="p-4 text-white font-sans">{loan.borrowerId}</td>
                    <td className="p-4 text-[#ededed]" dir="ltr">{(loan.assetValue || 0).toLocaleString()} د.ع</td>
                    <td className="p-4 text-[#737373]">{loan.tenure} شهر</td>
                    <td className="p-4 text-[#ededed]">{new Date(loan.nextDue).toLocaleDateString('ar-IQ')}</td>
                    <td className="p-4">
                      <span className={loan.score === 'B-' ? "text-[#f59e0b]" : "text-[#10b981]"}>{loan.score || 'A'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Column: Risk & Analytics */}
      <section className="col-span-12 flex flex-col gap-6 lg:col-span-3">
        <div className="rounded-lg border border-[#262626] bg-[#141414] p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ededed]">توزيع المستثمرين</h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-[#737373]">مؤسسات</p>
                  <p className="font-mono text-lg text-[#ededed]">{institutionalCapital.toLocaleString('en-US')} د.ع</p>
                </div>
                <span className="mb-1 text-[10px] text-[#10b981]">نسبة {instPercent}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-[#262626] mt-1">
                <div className="h-full bg-[#10b981]" style={{ width: `${instPercent}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-[#737373]">أفراد / صغار</p>
                  <p className="font-mono text-lg text-[#ededed]">{retailCapital.toLocaleString('en-US')} د.ع</p>
                </div>
                <span className="mb-1 text-[10px] text-[#10b981]">نسبة {retailPercent}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-[#262626] mt-1">
                <div className="h-full bg-[#10b981]" style={{ width: `${retailPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ededed]">محرك التحصيل</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded border border-[#262626] bg-[#0f0f0f] p-3">
              <div className="h-2 w-2 rounded-full bg-[#737373]"></div>
              <div className="flex-1">
                <p className="text-[11px] text-white">نجاح السحب التلقائي</p>
                <p className="text-[10px] text-[#737373]">آخر 24 ساعة: 0 معاملة</p>
              </div>
              <p className="font-mono text-xs font-bold text-[#ededed]">0.0%</p>
            </div>
            <div className="flex items-center gap-3 rounded border border-[#262626] bg-[#0f0f0f] p-3">
              <div className="h-2 w-2 rounded-full bg-[#737373]"></div>
              <div className="flex-1">
                <p className="text-[11px] text-white">الاسترداد اليدوي</p>
                <p className="text-[10px] text-[#737373]">التذاكر النشطة: 0</p>
              </div>
              <p className="font-mono text-xs font-bold text-[#ededed]">0.0%</p>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-[10px] uppercase text-[#737373]">تنبيه توقع المخاطر</p>
              <p className="text-[12px] italic leading-relaxed text-[#ededed] opacity-80">
                &quot;لا توجد بيانات كافية لإصدار التنبيهات حول نمط التعثر.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
