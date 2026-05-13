'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Printer, Download, User, Info, FileText, CheckCircle, AlertTriangle, Edit, Trash2, Save, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const loanId = unwrappedParams.id;
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit borrower modal state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    borrowerName: '',
    phone: '',
    address: '',
    job: '',
    status: 'active'
  });

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
        setEditForm({
          borrowerName: data.borrowerName || '',
          phone: data.phone || '',
          address: data.address || '',
          job: data.job || '',
          status: data.status || 'active'
        });
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
    const input = window.prompt(`الرجاء إدخال المبلغ المراد دفعه لهذه الدفعة (المتبقي: ${remainingToPay.toLocaleString()} د.ع):`, remainingToPay.toString());
    
    if (input === null) return;
    const paymentAmount = parseFloat(input.trim());
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      showToast('error', 'مبلغ غير صالح', 'يرجى إدخال رقم صحيح أكبر من صفر.');
      return;
    }
    if (paymentAmount > remainingToPay) {
      showToast('error', 'مبلغ يتجاوز المتبقي', 'لا يمكنك دفع مبلغ أكبر من المبلغ المتبقي لهذه الدفعة.');
      return;
    }

    const ok = await confirm({
      title: 'تأكيد عملية السداد',
      message: `هل أنت متأكد من سداد ${paymentAmount.toLocaleString()} د.ع للقسط رقم #${installmentNumber}؟`,
      confirmText: 'تأكيد السداد',
      variant: 'warning',
    });
    if (!ok) return;

    // ── Optimistic UI: تحديث فوري ──
    const previousLoan = { ...loan, schedule: [...(loan.schedule || [])] };
    setLoan((prev: any) => ({
      ...prev,
      schedule: prev.schedule.map((s: any) => {
        if (s.installmentNumber === installmentNumber) {
          const newPaid = parseFloat(s.paidAmount || '0') + paymentAmount;
          const fullyPaid = newPaid >= parseFloat(s.amount || '0');
          return { ...s, paidAmount: newPaid.toString(), status: fullyPaid ? 'paid' : s.status };
        }
        return s;
      }),
    }));
    showToast('success', 'تم تسجيل السداد', `${paymentAmount.toLocaleString()} د.ع — القسط #${installmentNumber}`);

    try {
      const res = await fetch(`/api/loans/${loanId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay_installment', installmentNumber, paidAmount: paymentAmount })
      });
      if (res.ok) {
        fetchLoan(); // مزامنة مع الخادم
      } else {
        // ROLLBACK: التراجع في حالة الخطأ
        setLoan(previousLoan);
        showToast('error', 'فشل في السداد', 'حدث خطأ — تم التراجع عن التحديث.');
      }
    } catch (e) {
      console.error(e);
      setLoan(previousLoan);
      showToast('error', 'خطأ في الاتصال', 'تعذر الاتصال بالخادم — تم التراجع.');
    }
  };

  const handleClearLoan = async () => {
    const ok = await confirm({
      title: 'إطفاء القرض بالكامل',
      message: 'سيتم تسجيل سداد جميع الدفعات المتبقية. هل أنت متأكد؟',
      confirmText: 'إطفاء القرض',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/loans/${loanId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_loan' })
      });
      if (res.ok) {
        showToast('success', 'تم إطفاء القرض', 'تم سداد جميع الأقساط بنجاح.');
        fetchLoan();
      } else {
        showToast('error', 'فشل في إطفاء القرض', 'حدث خطأ أثناء معالجة الطلب.');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'خطأ في الاتصال', 'تعذر الوصول إلى الخادم.');
    }
  };

  // Submit borrower info edits
  const handleUpdateBorrower = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchLoan();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'فشل تحديث بيانات المقترض');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setSaving(false);
    }
  };

  // Delete entire loan handler
  const handleDeleteLoan = async () => {
    const ok = await confirm({
      title: 'حذف القرض نهائياً',
      message: 'سيتم حذف هذا القرض مع كافة سجلات وجداول السداد الخاصة به. هذا الإجراء نهائي ولا يمكن التراجع عنه.',
      confirmText: 'حذف نهائي',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/loans/${loanId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'تم حذف القرض', 'تم حذف القرض وجميع سجلاته بنجاح.');
        router.push('/dashboard/loans');
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast('error', 'فشل حذف القرض', errData.error || 'حدث خطأ غير متوقع.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'خطأ في الاتصال', 'تعذر الوصول إلى الخادم.');
    }
  };

  const printReceipt = (installment: any) => {
    if (!loan) return;
    const paidAmount = parseFloat(installment.paidAmount || '0');
    const amountDue = parseFloat(installment.amount || '0');
    const remainingAmount = Math.max(0, amountDue - paidAmount);
    
    const isFullyPaid = installment.status === 'paid' || paidAmount >= amountDue;
    const isPartial = !isFullyPaid && paidAmount > 0;
    const isUnpaid = !isFullyPaid && !isPartial;
    
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

  // ── 4.1: Branded Full-Contract Export ──────────────────────────
  const printFullContract = () => {
    if (!loan) return;
    const scheduleRows = loan.schedule.map((s: any) => {
      const amt = parseFloat(s.amount || '0');
      const paid = parseFloat(s.paidAmount || '0');
      const rem = Math.max(0, amt - paid);
      const statusText = s.status === 'paid' ? 'مسدد ✓' : paid > 0 ? 'جزئي' : 'مستحق';
      const statusColor = s.status === 'paid' ? '#065f46' : paid > 0 ? '#1e40af' : '#991b1b';
      return `<tr>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">#${s.installmentNumber}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${new Date(s.dueDate).toLocaleDateString('ar-IQ')}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-family:monospace">${Math.round(amt).toLocaleString()}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-family:monospace;color:#10b981">${Math.round(paid).toLocaleString()}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-family:monospace;color:#f59e0b">${Math.round(rem).toLocaleString()}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-weight:bold;color:${statusColor}">${statusText}</td>
      </tr>`;
    }).join('');

    const contractHTML = `<html dir="rtl">
      <head>
        <title>عقد تسهيلات ائتمانية - ${loan.borrowerName}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Segoe UI',Tahoma,sans-serif; color:#1a1a1a; background:#fff; }
          .page { max-width:800px; margin:0 auto; padding:40px; }
          .brand { text-align:center; padding-bottom:24px; border-bottom:3px solid #10b981; margin-bottom:24px; }
          .brand h1 { font-size:32px; color:#10b981; letter-spacing:2px; margin-bottom:4px; }
          .brand p { color:#666; font-size:13px; }
          .contract-title { text-align:center; margin:20px 0; padding:12px; background:linear-gradient(135deg,#f0fdf4,#ecfdf5); border:2px solid #10b981; border-radius:8px; }
          .contract-title h2 { font-size:20px; color:#064e3b; }
          .contract-title p { font-size:12px; color:#666; margin-top:4px; }
          .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:20px 0; }
          .info-box { padding:14px; border:1px solid #e5e7eb; border-radius:6px; background:#fafafa; }
          .info-box label { font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:4px; }
          .info-box span { font-size:15px; font-weight:bold; color:#1a1a1a; }
          .section-title { font-size:14px; font-weight:bold; color:#10b981; margin:24px 0 8px; padding-bottom:6px; border-bottom:1px solid #e5e7eb; }
          table { width:100%; border-collapse:collapse; margin:12px 0; font-size:13px; }
          th { background:#f9fafb; padding:10px 8px; border:1px solid #e5e7eb; font-size:11px; text-transform:uppercase; color:#666; letter-spacing:0.5px; }
          .signatures { display:flex; justify-content:space-between; margin-top:60px; padding-top:20px; border-top:2px dashed #ccc; }
          .sig-block { text-align:center; width:40%; font-size:14px; font-weight:bold; }
          .sig-line { margin-top:40px; border-top:1px solid #333; padding-top:6px; font-size:12px; color:#666; }
          .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:80px; color:rgba(16,185,129,0.04); font-weight:900; pointer-events:none; z-index:0; letter-spacing:8px; }
          @media print { .page { padding:20px; } .watermark { color:rgba(16,185,129,0.03); } }
        </style>
      </head>
      <body>
        <div class="watermark">NEONFIN</div>
        <div class="page">
          <div class="brand">
            <h1>neonFin</h1>
            <p>منصة الحلول المالية المتكاملة | Financial Solutions Platform</p>
          </div>

          <div class="contract-title">
            <h2>عقد تسهيلات ائتمانية (مرابحة)</h2>
            <p>رقم العقد: CTR-${loan.id.substring(0, 8).toUpperCase()} | تاريخ التحرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
          </div>

          <div class="section-title">بيانات المقترض / المستفيد</div>
          <div class="info-grid">
            <div class="info-box"><label>الاسم الكامل</label><span>${loan.borrowerName}</span></div>
            <div class="info-box"><label>رقم الهاتف</label><span dir="ltr">${loan.phone || '-'}</span></div>
            <div class="info-box"><label>العنوان السكني</label><span>${loan.address || '-'}</span></div>
            <div class="info-box"><label>المهنة / الوظيفة</label><span>${loan.job || '-'}</span></div>
          </div>

          <div class="section-title">الشروط المالية للتسهيل</div>
          <div class="info-grid">
            <div class="info-box"><label>مبلغ التمويل (المستلم)</label><span dir="ltr" style="color:#10b981">${loan.assetValue.toLocaleString()} IQD</span></div>
            <div class="info-box"><label>المديونية الإجمالية</label><span dir="ltr" style="color:#ef4444">${loan.totalDebt.toLocaleString()} IQD</span></div>
            <div class="info-box"><label>المدة الإجمالية</label><span>${loan.tenure} شهر</span></div>
            <div class="info-box"><label>قيمة القسط الشهري</label><span dir="ltr">${Math.round(loan.totalDebt / loan.tenure).toLocaleString()} IQD</span></div>
          </div>

          <div class="section-title">جدول الأقساط والاستحقاق</div>
          <table>
            <thead>
              <tr>
                <th>الدفعة</th>
                <th>تاريخ الاستحقاق</th>
                <th>المبلغ</th>
                <th>المسدد</th>
                <th>المتبقي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>${scheduleRows}</tbody>
          </table>

          <div class="signatures">
            <div class="sig-block">
              الطرف الأول (المموّل)
              <div class="sig-line">التوقيع والختم</div>
            </div>
            <div class="sig-block">
              الطرف الثاني (المستفيد)
              <div class="sig-line">التوقيع</div>
            </div>
          </div>
        </div>
        <script>window.onload=()=>{window.print();}</script>
      </body>
    </html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(contractHTML);
      w.document.close();
    }
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
    <div className="flex flex-col gap-6 h-full pb-10 print:bg-white print:text-black min-h-screen relative">
      {/* Header - Hidden on Print */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">تفاصيل القرض</h2>
          <p className="text-sm text-[#737373] mt-1 font-mono">المعرف: {loan.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {loan.status !== 'completed' && (
            <button 
              onClick={handleClearLoan}
              className="flex items-center gap-1.5 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#ef4444]/20 transition-colors">
              <CheckCircle size={15} />
              <span>إطفاء بالكامل</span>
            </button>
          )}
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-[#0f0f0f] border border-[#262626] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
            <Download size={15} />
            <span>تصدير CSV</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#10b981] text-black text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#34d399] transition-colors">
            <Printer size={15} />
            <span>طباعة</span>
          </button>
          <button 
            onClick={printFullContract}
            className="flex items-center gap-1.5 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#10b981]/20 transition-colors">
            <FileText size={15} />
            <span>تصدير العقد</span>
          </button>
          
          {/* Delete Action Button */}
          <button 
            onClick={handleDeleteLoan}
            className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:text-white hover:bg-red-600 text-xs font-bold px-3 py-2 rounded-lg transition-all duration-200 mr-2">
            <Trash2 size={15} />
            <span>حذف القرض</span>
          </button>

          <Link 
            href="/dashboard/loans" 
            className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-2 hover:text-[#737373] transition-colors mr-2 border border-transparent">
            <ArrowRight size={15} />
            <span>رجوع</span>
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
        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] print:bg-white border border-[#262626] hover:border-[#10b981]/30 print:border-gray-200 rounded-xl p-6 transition-all duration-300 shadow-xl relative group">
          <div className="flex items-center justify-between mb-6 border-b border-[#262626] print:border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#10b981] print:text-black" />
              <h3 className="text-lg font-bold text-white print:text-black">بيانات الزبون</h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-md border border-[#10b981]/20 hover:bg-[#10b981]/20 transition-colors print:hidden"
            >
              <Edit size={13} />
              <span>تعديل</span>
            </button>
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
        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] print:bg-white border border-[#262626] hover:border-[#10b981]/30 print:border-gray-200 rounded-xl p-6 transition-all duration-300 shadow-xl">
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
            <div className="col-span-2 mt-2 pt-3 border-t border-[#262626] print:border-gray-200">
              <p className="text-[10px] text-[#737373] print:text-gray-500 uppercase mb-2">التصنيف الائتماني الديناميكي</p>
              <div className="flex items-center gap-3">
                {(() => {
                  const s = loan.score || 'A';
                  const scoreConfig: Record<string, {color: string, bg: string, border: string, label: string, glow: string}> = {
                    'A+': { color: 'text-[#10b981]', bg: 'bg-[#10b981]/15', border: 'border-[#10b981]', label: 'ممتاز+', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]' },
                    'A':  { color: 'text-[#10b981]', bg: 'bg-[#10b981]/10', border: 'border-[#10b981]/60', label: 'جيد جداً', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
                    'B':  { color: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/60', label: 'متوسط', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]' },
                    'C':  { color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/60', label: 'مرتفع المخاطر', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]' },
                  };
                  const cfg = scoreConfig[s] || scoreConfig['A'];
                  const TrendIcon = s === 'A+' ? TrendingUp : s === 'C' ? TrendingDown : Minus;
                  const trendLabel = s === 'A+' ? 'اتجاه تصاعدي' : s === 'C' ? 'اتجاه هبوطي' : 'مستقر';
                  return (
                    <>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-black font-mono border-2 ${cfg.color} ${cfg.bg} ${cfg.border} ${cfg.glow} print:shadow-none print:border-gray-300`}>
                        {s}
                        <span className="text-[10px] font-bold font-sans mr-1">{cfg.label}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] ${cfg.color} font-bold`}>
                        <TrendIcon size={13} />
                        {trendLabel}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-[#141414] print:bg-white border border-[#262626] print:border-gray-200 rounded-xl overflow-hidden flex-1 flex flex-col shadow-2xl">
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
                        {isLate && <span title="متأخر عن السداد"><AlertTriangle size={14} className="text-[#ef4444] print:hidden" /></span>}
                      </td>
                      <td className="p-4 text-[#ededed] print:text-black" dir="ltr">{Math.round(amount).toLocaleString()}</td>
                      <td className="p-4 text-[#10b981] print:text-black" dir="ltr">{Math.round(paidAmount).toLocaleString()}</td>
                      <td className="p-4 text-[#f59e0b] print:text-black" dir="ltr">{Math.round(remaining).toLocaleString()}</td>
                      <td className="p-4">
                        {installment.status === 'pending' ? (
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${isLate ? 'bg-[#ef4444]/10 text-[#ef4444] ring-[#ef4444]/20' : isPartial ? 'bg-[#3b82f6]/10 text-[#3b82f6] ring-[#3b82f6]/20' : 'bg-[#f59e0b]/10 text-[#f59e0b] ring-[#f59e0b]/20'} print:border print:border-gray-300 print:text-black`}>
                            {isLate ? 'متأخر' : isPartial ? 'تسديد جزئي' : 'قيد الانتظار'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#10b981]/20 px-2.5 py-1 text-xs font-black text-[#10b981] ring-2 ring-inset ring-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-in zoom-in-75 duration-300 print:border print:border-gray-300 print:text-black print:shadow-none border border-dashed border-[#10b981]">
                            <CheckCircle size={12} className="animate-bounce" />
                            ختم: تم السداد
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

      {/* Edit Borrower Info Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#262626] rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-[#262626] bg-[#0f0f0f]">
              <h3 className="font-bold text-white text-base">تعديل بيانات المقترض</h3>
              <button onClick={() => setIsEditing(false)} className="text-[#737373] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateBorrower} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#737373]">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  value={editForm.borrowerName} 
                  onChange={e => setEditForm({...editForm, borrowerName: e.target.value})}
                  className="rounded border border-[#262626] bg-[#0f0f0f] p-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#737373]">رقم الهاتف</label>
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  className="rounded border border-[#262626] bg-[#0f0f0f] p-2.5 text-sm text-white font-mono text-right focus:border-[#10b981] outline-none"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#737373]">العنوان السكني</label>
                <input 
                  type="text" 
                  value={editForm.address} 
                  onChange={e => setEditForm({...editForm, address: e.target.value})}
                  className="rounded border border-[#262626] bg-[#0f0f0f] p-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#737373]">المهنة / العمل</label>
                <input 
                  type="text" 
                  value={editForm.job} 
                  onChange={e => setEditForm({...editForm, job: e.target.value})}
                  className="rounded border border-[#262626] bg-[#0f0f0f] p-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#737373]">حالة القرض العامة</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                  className="rounded border border-[#262626] bg-[#0f0f0f] p-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                >
                  <option value="active">نشط</option>
                  <option value="completed">مكتمل</option>
                  <option value="defaulted">متعثر / متأخر</option>
                  <option value="pending">قيد الانتظار</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded bg-transparent border border-[#262626] text-white font-bold text-xs hover:bg-[#1a1a1a]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded bg-[#10b981] text-black font-bold text-xs hover:bg-[#34d399] flex justify-center items-center gap-1 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
