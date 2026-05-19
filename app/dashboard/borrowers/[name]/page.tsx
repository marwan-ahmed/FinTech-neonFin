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
  Printer
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

  // ── 4.1: Branded PDF Statement Export ──────────────────────────
  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHTML = borrowerLoans.map((loan) => {
      const loanSchedulesHTML = (loan.schedule || []).map((s: any) => {
        const amt = parseFloat(s.amount || '0');
        const paid = parseFloat(s.paidAmount || '0');
        return `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee; font-family:monospace; color:#666;">${loan.id.substring(0,6).toUpperCase()}</td>
            <td style="padding:10px; border-bottom:1px solid #eee;">${new Date(s.dueDate).toLocaleDateString('ar-IQ')}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${s.installmentNumber}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; font-family:monospace;">${amt.toLocaleString()}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; font-family:monospace; color:#10b981;">${paid.toLocaleString()}</td>
            <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold; color:${s.status === 'paid' ? '#065f46' : paid > 0 ? '#1e40af' : '#991b1b'};">${s.status === 'paid' ? 'مسدد ✓' : (paid > 0 ? 'جزئي' : 'مستحق')}</td>
          </tr>
        `;
      }).join('');
      return loanSchedulesHTML;
    }).join('');

    const html = `
      <html dir="rtl">
        <head>
          <title>كشف حساب التسهيلات - ${borrowerName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a1a; background: #fff; }
            .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:100px; color:rgba(16,185,129,0.03); font-weight:900; pointer-events:none; z-index:0; letter-spacing:10px; }
            .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; position: relative; z-index: 1; }
            .header h1 { color: #10b981; margin: 0 0 5px 0; font-size: 32px; letter-spacing: 2px; }
            .header p { margin: 0; color: #666; font-size: 14px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; position: relative; z-index: 1; }
            .sum-box { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
            .sum-box label { display: block; font-size: 11px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; }
            .sum-box span { font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; text-align: right; font-size: 13px; position: relative; z-index: 1; }
            th { background: #f1f5f9; padding: 12px 10px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="watermark">NEONFIN</div>
          <div class="header">
            <h1>neonFin</h1>
            <p>كشف حساب تفصيلي للتسهيلات الائتمانية | Statement of Account</p>
          </div>
          
          <div style="margin-bottom: 20px; font-size: 15px;">
            <strong>اسم الزبون / المستفيد:</strong> ${borrowerName} <br/>
            <strong style="color: #666; font-size: 13px;">تاريخ استخراج الكشف: ${new Date().toLocaleDateString('ar-IQ')}</strong>
          </div>

          <div class="summary">
            <div class="sum-box">
              <label>إجمالي التعاملات</label>
              <span dir="ltr">${stats.totalDebt.toLocaleString()} IQD</span>
            </div>
            <div class="sum-box">
              <label>إجمالي المسدد</label>
              <span dir="ltr" style="color:#10b981">${stats.totalPaid.toLocaleString()} IQD</span>
            </div>
            <div class="sum-box">
              <label>المتبقي (الذمة)</label>
              <span dir="ltr" style="color:#ef4444">${Math.max(0, stats.remaining).toLocaleString()} IQD</span>
            </div>
            <div class="sum-box">
              <label>معدل الالتزام (Score)</label>
              <span dir="ltr" style="color:#3b82f6">${stats.complianceRate}% (${score})</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>معرف القرض</th>
                <th>تاريخ الاستحقاق</th>
                <th style="text-align:center;">رقم الدفعة</th>
                <th>قيمة القسط</th>
                <th>الواصل</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          
          <div style="margin-top: 50px; text-align: left; font-size: 14px; font-weight: bold; color: #333;">
            توقيع وختم الإدارة: ................................
          </div>
          
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

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
        <button onClick={handlePrintStatement} className="flex items-center gap-1.5 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#10b981]/20 transition-colors">
          <Printer size={15} />
          <span>كشف حساب PDF</span>
        </button>
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
