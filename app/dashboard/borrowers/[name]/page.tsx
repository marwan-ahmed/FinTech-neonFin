'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  ArrowRight,
  User,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export default function BorrowerProfilePage() {
  const params = useParams();
  const borrowerName = decodeURIComponent(params.name as string);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchLoans() {
      try {
        const res = await fetch('/api/loans');
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!res.ok) throw new Error('فشل في تحميل البيانات');
        const data = await res.json();
        if (active) setAllLoans(data);
      } catch (err) {
        console.error('خطأ في تحميل بيانات المقترض:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchLoans();
    return () => { active = false; };
  }, []);

  // تصفية قروض المقترض المحدد
  const borrowerLoans = useMemo(
    () => allLoans.filter((l) => l.borrowerName === borrowerName),
    [allLoans, borrowerName]
  );

  // معلومات المقترض من أحدث قرض
  const latestLoan = borrowerLoans[0];
  const phone = latestLoan?.phone || '—';
  const address = latestLoan?.address || '—';
  const job = latestLoan?.job || '—';
  const score = latestLoan?.score || 'A';

  // الإحصائيات المالية
  const stats = useMemo(() => {
    let totalDebt = 0;
    let totalPaid = 0;
    let totalInstallments = 0;
    let paidOnTime = 0;
    let paidLate = 0;
    let pending = 0;

    borrowerLoans.forEach((loan) => {
      totalDebt += parseFloat(loan.totalDebt || 0);
      const schedule = loan.schedule || [];
      schedule.forEach((s: any) => {
        totalInstallments++;
        const amt = parseFloat(s.amount || 0);
        const paidAmt = parseFloat(s.paidAmount || 0);
        totalPaid += paidAmt;
        if (s.status === 'paid') {
          // إذا دفع قبل أو في تاريخ الاستحقاق يعتبر في الوقت
          if (s.paidAt && new Date(s.paidAt) <= new Date(s.dueDate)) {
            paidOnTime++;
          } else {
            paidLate++;
          }
        } else {
          pending++;
        }
      });
    });

    const complianceRate = totalInstallments > 0
      ? Math.round(((paidOnTime) / Math.max(paidOnTime + paidLate, 1)) * 100)
      : 0;

    return { totalDebt, totalPaid, remaining: totalDebt - totalPaid, totalInstallments, paidOnTime, paidLate, pending, complianceRate };
  }, [borrowerLoans]);

  // لون التصنيف
  const scoreColor = score === 'C' ? 'text-[#ef4444]' : score === 'B' ? 'text-[#f59e0b]' : 'text-[#10b981]';
  const scoreBg = score === 'C' ? 'bg-[#ef4444]/10 border-[#ef4444]/30' : score === 'B' ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30' : 'bg-[#10b981]/10 border-[#10b981]/30';
  const ScoreIcon = score === 'C' ? TrendingDown : score === 'B' ? Minus : TrendingUp;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="animate-spin text-[#10b981]" size={32} />
      </div>
    );
  }

  if (borrowerLoans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <User size={40} className="text-[#525252]" />
        <p className="text-[#737373] text-sm">لم يتم العثور على مقترض بهذا الاسم.</p>
        <Link href="/dashboard/loans" className="text-xs text-[#10b981] hover:underline">العودة لإدارة القروض</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* رأس الصفحة */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <Link href="/dashboard/loans" className="text-[#737373] hover:text-white transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{borrowerName}</h1>
          <p className="text-xs text-[#737373] mt-0.5">الملف الشخصي والتاريخ الائتماني</p>
        </div>
        <div className={`mr-auto flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${scoreBg} ${scoreColor}`}>
          <ScoreIcon size={14} />
          <span>التصنيف: {score}</span>
        </div>
      </div>

      {/* بطاقة المعلومات الأساسية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{animationDelay: '50ms'}}>
        <div className="flex items-center gap-3 rounded-xl border border-[#262626] bg-[#141414] p-4">
          <div className="h-9 w-9 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
            <User size={18} />
          </div>
          <div>
            <p className="text-[10px] text-[#525252] uppercase tracking-widest">الاسم</p>
            <p className="text-sm font-bold text-white">{borrowerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#262626] bg-[#141414] p-4">
          <div className="h-9 w-9 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-[10px] text-[#525252] uppercase tracking-widest">الهاتف</p>
            <p className="text-sm font-bold text-white font-mono" dir="ltr">{phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#262626] bg-[#141414] p-4">
          <div className="h-9 w-9 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-[10px] text-[#525252] uppercase tracking-widest">العنوان</p>
            <p className="text-sm font-bold text-white">{address}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#262626] bg-[#141414] p-4">
          <div className="h-9 w-9 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-[10px] text-[#525252] uppercase tracking-widest">الوظيفة</p>
            <p className="text-sm font-bold text-white">{job}</p>
          </div>
        </div>
      </div>

      {/* المؤشرات المالية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{animationDelay: '100ms'}}>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <p className="text-[10px] text-[#525252] uppercase tracking-widest mb-1">إجمالي التعاملات</p>
          <p className="text-lg font-bold font-mono text-white" dir="ltr">{stats.totalDebt.toLocaleString()} <span className="text-xs text-[#525252]">د.ع</span></p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <p className="text-[10px] text-[#525252] uppercase tracking-widest mb-1">المسدد</p>
          <p className="text-lg font-bold font-mono text-[#10b981]" dir="ltr">{stats.totalPaid.toLocaleString()} <span className="text-xs text-[#525252]">د.ع</span></p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <p className="text-[10px] text-[#525252] uppercase tracking-widest mb-1">المتبقي</p>
          <p className="text-lg font-bold font-mono text-[#f59e0b]" dir="ltr">{Math.max(0, stats.remaining).toLocaleString()} <span className="text-xs text-[#525252]">د.ع</span></p>
        </div>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <p className="text-[10px] text-[#525252] uppercase tracking-widest mb-1">معدل الالتزام</p>
          <div className="flex items-end gap-2">
            <p className={`text-lg font-bold font-mono ${stats.complianceRate >= 80 ? 'text-[#10b981]' : stats.complianceRate >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>{stats.complianceRate}%</p>
            <p className="text-[10px] text-[#525252] mb-0.5">{stats.paidOnTime} من {stats.paidOnTime + stats.paidLate}</p>
          </div>
        </div>
      </div>

      {/* سجل القروض */}
      <div className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden animate-fade-in-up" style={{animationDelay: '150ms'}}>
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#1a1a1a] p-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard size={16} className="text-[#10b981]" />
            سجل القروض ({borrowerLoans.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#525252]">
              <tr>
                <th className="p-4 font-normal">معرف القرض</th>
                <th className="p-4 font-normal">المبلغ</th>
                <th className="p-4 font-normal">المدة</th>
                <th className="p-4 font-normal">الحالة</th>
                <th className="p-4 font-normal">التاريخ</th>
                <th className="p-4 font-normal text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {borrowerLoans.map((loan) => (
                <tr key={loan.id} className="border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors">
                  <td className="p-4 text-xs text-[#737373]">{loan.id.slice(0, 8)}...</td>
                  <td className="p-4 text-white font-bold" dir="ltr">{parseFloat(loan.totalDebt || 0).toLocaleString()} د.ع</td>
                  <td className="p-4 text-[#737373]">{loan.tenure} شهر</td>
                  <td className="p-4">
                    {loan.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-xs font-bold text-[#3b82f6] border border-[#3b82f6]/20">
                        <CheckCircle size={10} /> مكتمل
                      </span>
                    ) : loan.status === 'defaulted' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ef4444]/10 px-2 py-0.5 text-xs font-bold text-[#ef4444] border border-[#ef4444]/20">
                        <AlertTriangle size={10} /> متعثر
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#10b981]/10 px-2 py-0.5 text-xs font-bold text-[#10b981] border border-[#10b981]/20">
                        <TrendingUp size={10} /> نشط
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-[#525252]">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString('ar-IQ') : '—'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      href={`/dashboard/loans/${loan.id}`}
                      className="inline-block bg-[#262626] hover:bg-[#10b981] text-[#ededed] hover:text-black font-bold px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
