'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Printer, Download, User, Info, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const loanId = unwrappedParams.id;
  
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoan = async () => {
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
        setError(null);
      } else {
         setError("Failed to fetch loan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [loanId]);

  const handlePayInstallment = async (installmentNumber: number, amountDue: number, currentPaid: number) => {
    const remainingToPay = amountDue - currentPaid;
    const input = prompt(`الرجاء إدخال المبلغ المراد دفعه لهذه الدفعة (المتبقي: ${remainingToPay.toLocaleString()} د.ع):`, remainingToPay.toString());
    
    if (input === null) return; // User cancelled
    const paymentAmount = parseFloat(input.trim());
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('مبلغ غير صالح');
      return;
    }
    if (paymentAmount > remainingToPay) {
      alert('لا يمكنك دفع مبلغ أكبر من المبلغ المتبقي لهذه الدفعة.');
      return;
    }

    if (!confirm(`هل أنت متأكد من سداد ${paymentAmount.toLocaleString()} د.ع؟`)) return;
    try {
      const res = await fetch(`/api/loans/${loanId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay_installment', installmentNumber, paidAmount: paymentAmount })
      });
      if (res.ok) {
        fetchLoan(); // Refresh
      } else {
        alert('حدث خطأ أثناء السداد');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء السداد');
    }
  };

  const handleClearLoan = async () => {
    if (!confirm('هل أنت متأكد من إطفاء القرض بالكامل (سداد جميع الدفعات المتبقية)؟')) return;
    try {
      const res = await fetch(`/api/loans/${loanId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_loan' })
      });
      if (res.ok) {
        fetchLoan(); // Refresh
      } else {
        alert('حدث خطأ أثناء إطفاء القرض');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء إطفاء القرض');
    }
  };

  const printReceipt = (installment: any) => {
    if (!loan) return;
    const paidAmount = parseFloat(installment.paidAmount || '0');
    const amountDue = parseFloat(installment.amount || '0');
    const remainingAmount = Math.max(0, amountDue - paidAmount);
    
    // Status should also consider the installment.status from the backend if possible
    // But based on amounts:
    const isFullyPaid = installment.status === 'paid' || paidAmount >= amountDue;
    const isPartial = !isFullyPaid && paidAmount > 0;
    const isUnpaid = !isFullyPaid && !isPartial;
    
    // For display amount on receipt:
    // If it's a receipt for payment (full or partial), show what was paid.
    // If it's an invoice for an unpaid installment, show what is due.
    const displayAmount = (isFullyPaid || isPartial) ? paidAmount : amountDue;
    
    const titleText = isUnpaid ? 'إشعار استحقاق نقدية' : 'وصل استلام نقدية';
    const personText = isUnpaid ? 'المطلوب من السيد/ة:' : 'استلمنا من السيد/ة:';
    const forText = isUnpaid 
      ? `استحقاق القسط رقم #${installment.installmentNumber}` 
      : `سداد الدفعة رقم #${installment.installmentNumber}`;

    const receiptHTML = `
      <html dir="rtl">
        <head>
          <title>${titleText} - دفعة #${installment.installmentNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .receipt-container { border: 2px solid #333; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #10b981; font-size: 28px; }
            .header p { margin: 5px 0 0 0; color: #777; font-size: 14px; }
            .details { line-height: 2.2; font-size: 16px; }
            .details strong { color: #000; display: inline-block; width: 180px; }
            .value { border-bottom: 1px dotted #999; padding-left: 10px; font-weight: bold; }
            .status-label { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 14px; font-weight: bold; margin-right: 10px; }
            .status-paid { background-color: #d1fae5; color: #065f46; border: 1px solid #34d399; }
            .status-partial { background-color: #dbeafe; color: #1e40af; border: 1px solid #60a5fa; }
            .status-unpaid { background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; }
            .footer-sig { text-align: center; }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; box-shadow: none; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1 style="color: ${isUnpaid ? '#ef4444' : '#10b981'};">${titleText}</h1>
              <p>شركة نيون فين للحلول المالية</p>
            </div>
            <div class="details">
              <div><strong>رقم الوصل/الإشعار:</strong> <span class="value">REC-${loan.id.substring(0, 6).toUpperCase()}-${installment.installmentNumber}</span></div>
              <div><strong>تاريخ التحرير:</strong> <span class="value">${new Date().toLocaleDateString('ar-IQ')}</span></div>
              <div><strong>تاريخ استحقاق القسط:</strong> <span class="value">${new Date(installment.dueDate).toLocaleDateString('ar-IQ')}</span></div>
              <div><strong>${personText}</strong> <span class="value">${loan.borrowerName}</span></div>
              <div><strong>القيمة الكلية للقسط:</strong> <span class="value" dir="ltr">${amountDue.toLocaleString()} دينار عراقي</span></div>
              ${paidAmount > 0 ? `<div><strong>الواصل (المبلغ المسدد):</strong> <span class="value" dir="ltr">${paidAmount.toLocaleString()} دينار عراقي</span></div>` : ''}
              ${remainingAmount > 0 ? `<div><strong>المتبقي من القسط:</strong> <span class="value" dir="ltr">${remainingAmount.toLocaleString()} دينار عراقي</span></div>` : ''}
              <div><strong>حالة الدفعة:</strong> 
                <span class="status-label ${isFullyPaid ? 'status-paid' : isPartial ? 'status-partial' : 'status-unpaid'}">
                  ${isFullyPaid ? 'مسدد بالكامل' : isPartial ? 'مسدد جزئياً' : 'غير مسدد (مستحق)'}
                </span>
              </div>
              <div><strong>البيان:</strong> <span class="value">${forText}</span></div>
            </div>
            <div class="footer">
              <div class="footer-sig">
                توقيع المستلم / المحاسب<br/><br/>
                ............................
              </div>
              <div class="footer-sig">
                توقيع الزبون<br/><br/>
                ............................
              </div>
            </div>
          </div>
          <script>
            window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
  };

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

  if (error || !loan) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-[#737373]">
        <p>{error || 'لم يتم العثور على القرض'}</p>
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
          {loan.status !== 'completed' && (
            <button 
              onClick={handleClearLoan}
              className="flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm font-bold px-4 py-2 rounded hover:bg-[#ef4444]/20 transition-colors">
              <CheckCircle size={16} />
              إطفاء القرض بالكامل
            </button>
          )}
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
                {loan.status === 'active' || loan.status === 'completed' ? (
                  <span className="text-[#10b981] print:text-black">
                    {loan.status === 'completed' ? 'مكتمل' : 'نشط'}
                  </span>
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
                  <th className="p-4 font-normal">المبلغ الكلي</th>
                  <th className="p-4 font-normal">المسدد</th>
                  <th className="p-4 font-normal">المتبقي</th>
                  <th className="p-4 font-normal">الحالة</th>
                  <th className="p-4 font-normal print:hidden">إجراءات</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {loan.schedule.map((installment: any, idx: number) => {
                  const isLate = installment.status === 'pending' && new Date(installment.dueDate) < new Date();
                  const amount = parseFloat(installment.amount || '0');
                  const paidAmount = parseFloat(installment.paidAmount || '0');
                  const remaining = amount - paidAmount;
                  const isPartial = paidAmount > 0 && paidAmount < amount;

                  return (
                    <tr key={idx} className={`border-b border-[#262626] print:border-gray-200 last:border-0 hover:bg-[#1a1a1a] print:hover:bg-white transition-colors ${isLate ? 'bg-[#ef4444]/5' : ''}`}>
                      <td className="p-4 text-white print:text-black">#{installment.installmentNumber}</td>
                      <td className={`p-4 ${isLate ? 'text-[#ef4444]' : 'text-[#ededed]'} print:text-black flex items-center gap-2`}>
                        {new Date(installment.dueDate).toLocaleDateString('ar-IQ')}
                        {isLate && <AlertTriangle size={14} className="text-[#ef4444] print:hidden" title="متأخر عن السداد" />}
                      </td>
                      <td className="p-4 text-[#ededed] print:text-black" dir="ltr">{Math.round(amount).toLocaleString()}</td>
                      <td className="p-4 text-[#10b981] print:text-black" dir="ltr">{Math.round(paidAmount).toLocaleString()}</td>
                      <td className="p-4 text-[#f59e0b] print:text-black" dir="ltr">{Math.round(remaining).toLocaleString()}</td>
                      <td className="p-4">
                        {installment.status === 'pending' ? (
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${isLate ? 'bg-[#ef4444]/10 text-[#ef4444] ring-[#ef4444]/20' : isPartial ? 'bg-[#3b82f6]/10 text-[#3b82f6] ring-[#3b82f6]/20' : 'bg-[#f59e0b]/10 text-[#f59e0b] ring-[#f59e0b]/20'} print:border print:border-gray-300 print:text-black`}>
                            {isLate ? 'متأخر' : isPartial ? 'تسديد جزئي' : 'قيد الانتظار'}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-[#10b981]/10 px-2 py-1 text-xs font-medium text-[#10b981] ring-1 ring-inset ring-[#10b981]/20 print:border print:border-gray-300 print:text-black">
                            مدفوع كلياً
                          </span>
                        )}
                      </td>
                      <td className="p-4 print:hidden">
                        <div className="flex items-center justify-end gap-2">
                          {installment.status === 'pending' && (
                            <button 
                              onClick={() => handlePayInstallment(installment.installmentNumber, amount, paidAmount)}
                              className="bg-[#10b981] text-black px-3 py-1 rounded text-xs font-bold hover:bg-[#34d399]">
                              {isPartial ? 'إكمال القسط' : 'تسديد'}
                            </button>
                          )}
                          <button 
                            onClick={() => printReceipt(installment)}
                            className="bg-[#0f0f0f] border border-[#262626] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[#1a1a1a]">
                            طباعة
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
