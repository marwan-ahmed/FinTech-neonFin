'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Printer, Download, User, Info, FileText } from 'lucide-react';
import Link from 'next/link';

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const loanId = unwrappedParams.id;
  
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLoan() {
      try {
        const res = await fetch(`/api/loans/${loanId}`);
        if (res.ok) {
          const data = await res.json();
          // parse fields
          data.assetValue = parseFloat(data.assetValue || 0);
          data.totalDebt = parseFloat(data.totalDebt || 0);
          data.marketCardValue = parseFloat(data.marketCardValue || 0);
          data.saleCardValue = parseFloat(data.saleCardValue || 0);
          setLoan(data);
        } else {
           console.error("Failed to fetch loan");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLoan();
  }, [loanId]);

  const exportCSV = () => {
    if (!loan) return;
    const headers = ['رقم الدفعة', 'تاريخ الاستحقاق', 'المبلغ (IQD)', 'الحالة'];
    const rows = loan.schedule.map((s: any) => [
      s.installmentNumber,
      new Date(s.dueDate).toLocaleDateString('ar-IQ'),
      Math.round(s.amount),
      s.status === 'pending' ? 'قيد الانتظار' : s.status === 'paid' ? 'مدفوع' : 'متأخر'
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `schedule_${loan.borrowerName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-[#10b981] h-8 w-8" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-[#737373]">
        <p>لم يتم العثور على القرض</p>
        <Link href="/dashboard/loans" className="text-[#10b981] hover:underline">العودة لإدارة القروض</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-10 print:bg-white print:text-black min-h-screen">
      {/* Header - Hidden on Print */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">تفاصيل القرض</h2>
          <p className="text-sm text-[#737373] mt-1">المعرف: {loan.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#0f0f0f] border border-[#262626] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[#1a1a1a] transition-colors">
            <Download size={16} />
            تصدير CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#10b981] text-black text-sm font-bold px-4 py-2 rounded hover:bg-[#34d399] transition-colors">
            <Printer size={16} />
            طباعة
          </button>
          <Link 
            href="/dashboard/loans" 
            className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2 hover:text-[#737373] transition-colors ml-4">
            <ArrowRight size={16} />
            رجوع
          </Link>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8 border-b border-black pb-4">
        <h1 className="text-2xl font-bold">جدول دفعات قرض</h1>
        <p className="text-sm text-gray-600 mt-2">التاريخ: {new Date().toLocaleDateString('ar-IQ')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Borrower Info Card */}
        <div className="bg-[#141414] print:bg-white border border-[#262626] print:border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-[#262626] print:border-gray-200 pb-3">
            <User size={18} className="text-[#10b981] print:text-black" />
            <h3 className="text-lg font-bold text-white print:text-black">بيانات الزبون</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">الاسم الكامل</p>
              <p className="text-sm text-[#ededed] print:text-black font-bold mt-1">{loan.borrowerName}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">رقم الهاتف</p>
              <p className="text-sm text-[#ededed] print:text-black font-mono mt-1" dir="ltr">{loan.phone || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">العنوان السكني</p>
              <p className="text-sm text-[#ededed] print:text-black mt-1">{loan.address || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">المهنة</p>
              <p className="text-sm text-[#ededed] print:text-black mt-1">{loan.job || '-'}</p>
            </div>
          </div>
        </div>

        {/* Loan Info Card */}
        <div className="bg-[#141414] print:bg-white border border-[#262626] print:border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-[#262626] print:border-gray-200 pb-3">
            <Info size={18} className="text-[#10b981] print:text-black" />
            <h3 className="text-lg font-bold text-white print:text-black">تفاصيل القرض</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">مبلغ القرض (المستلم)</p>
              <p className="text-sm text-[#10b981] print:text-black font-mono font-bold mt-1" dir="ltr">{loan.assetValue.toLocaleString()} IQD</p>
            </div>
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">الإجمالي المستحق (المديونية)</p>
              <p className="text-sm text-[#ef4444] print:text-black font-mono font-bold mt-1" dir="ltr">{loan.totalDebt.toLocaleString()} IQD</p>
            </div>
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">المدة</p>
              <p className="text-sm text-[#ededed] print:text-black font-bold mt-1">{loan.tenure} شهر</p>
            </div>
            <div>
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase">حالة القرض</p>
              <p className="text-sm text-[#ededed] print:text-black mt-1">
                {loan.status === 'active' ? (
                  <span className="text-[#10b981] print:text-black">نشط</span>
                ) : (
                  <span className="text-[#f59e0b] print:text-black">متأخر</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-[#141414] print:bg-white border border-[#262626] print:border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-4 border-b border-[#262626] print:border-gray-200 bg-[#1a1a1a] print:bg-white">
            <FileText size={18} className="text-[#10b981] print:text-black" />
            <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">جدول الدفعات والاستحقاق</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#0f0f0f] print:bg-gray-100 border-b border-[#262626] print:border-gray-300 text-[#737373] print:text-black text-[10px] uppercase">
                <tr>
                  <th className="p-4 font-normal">رقم الدفعة</th>
                  <th className="p-4 font-normal">تاريخ الاستحقاق</th>
                  <th className="p-4 font-normal">المبلغ (دينار)</th>
                  <th className="p-4 font-normal">الحالة</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {loan.schedule.map((installment: any, idx: number) => (
                  <tr key={idx} className="border-b border-[#262626] print:border-gray-200 last:border-0 hover:bg-[#1a1a1a] print:hover:bg-white transition-colors">
                    <td className="p-4 text-white print:text-black">#{installment.installmentNumber}</td>
                    <td className="p-4 text-[#ededed] print:text-black">{new Date(installment.dueDate).toLocaleDateString('ar-IQ')}</td>
                    <td className="p-4 text-[#10b981] print:text-black font-bold" dir="ltr">{Math.round(installment.amount).toLocaleString()}</td>
                    <td className="p-4">
                      {installment.status === 'pending' ? (
                        <span className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 print:bg-white print:border print:border-gray-300 px-2 py-1 rounded border border-[#f59e0b]/20">قيد الانتظار</span>
                      ) : installment.status === 'paid' ? (
                        <span className="text-[10px] text-[#10b981] bg-[#10b981]/10 print:bg-white print:border print:border-gray-300 px-2 py-1 rounded border border-[#10b981]/20">مدفوع</span>
                      ) : (
                        <span className="text-[10px] text-[#ef4444] bg-[#ef4444]/10 print:bg-white print:border print:border-gray-300 px-2 py-1 rounded border border-[#ef4444]/20">متأخر</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:flex justify-between items-center mt-12 pt-8 border-t border-black text-sm">
         <div>توقيع الزبون: .......................................</div>
         <div>توقيع وتفويض الموظف: .......................................</div>
      </div>
    </div>
  );
}
