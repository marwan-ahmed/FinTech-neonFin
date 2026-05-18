'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Plus, TrendingUp, Wallet, Coins, AlertTriangle, CheckCircle, ArrowUpDown, Download, Printer, CreditCard } from 'lucide-react';
import Link from 'next/link';

import NewLoanModal from "@/components/NewLoanModal";

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Premium UI Filters & Sort state
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'late', 'completed'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'debtDesc', 'debtAsc', 'remainingDesc', 'remainingAsc', 'dueAsc'

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error("Request timeout")), 30000); // 30 seconds timeout

    async function getLoans() {
      try {
        const res = await fetch('/api/loans', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!active) return;
        if (!res.ok) {
           setError('تأكد من ضبط متغيرات البيئة (Firebase Admin) في الإعدادات');
        } else {
          const data = await res.json();
          setLoans(data.map((l: any) => {
            const assetValue = parseFloat(l.assetValue || 0);
            const totalDebt = parseFloat(l.totalDebt || 0);
            
            // Calculate paid amount from schedule
            const schedule = l.schedule || [];
            const paidAmount = schedule
              .filter((s: any) => s.status === 'paid')
              .reduce((sum: number, s: any) => sum + (parseFloat(s.amount) || 0), 0);
            
            const remainingAmount = totalDebt - paidAmount;
            
            // Determine dynamic lateness status based on schedule overdue items
            const hasOverdueInstallments = schedule.some((s: any) => s.status === 'pending' && new Date(s.dueDate) < new Date());
            const computedStatus = l.status === 'completed' ? 'completed' : hasOverdueInstallments ? 'late' : l.status;

            return {
              ...l,
              borrowerId: l.borrowerName, // map for display
              assetValue,
              totalDebt,
              paidAmount,
              remainingAmount,
              computedStatus
            }
          }));
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.message === "Request timeout") {
           setError("انتهى وقت الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
           return;
        }
        console.error("Error fetching loans:", err);
        setError('حدث خطأ في الاتصال بالخادم. تأكد من الإعدادات.');
      } finally {
        if (active) setLoading(false);
      }
    }
    getLoans();
    return () => { active = false; };
  }, []);

  // Premium KPIs calculations
  const totalActiveDebt = loans.filter(l => l.computedStatus !== 'completed').reduce((sum, l) => sum + (l.totalDebt || 0), 0);
  const totalCollected = loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const totalRemaining = loans.filter(l => l.computedStatus !== 'completed').reduce((sum, l) => sum + (l.remainingAmount || 0), 0);
  const lateLoansCount = loans.filter(l => l.computedStatus === 'late' || l.status === 'defaulted').length;

  // Apply search and filter tabs
  let filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrowerId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && loan.computedStatus === 'active') ||
                          (filterStatus === 'late' && (loan.computedStatus === 'late' || loan.status === 'defaulted')) ||
                          (filterStatus === 'completed' && loan.computedStatus === 'completed');
                          
    return matchesSearch && matchesStatus;
  });

  // Apply sorting
  if (sortBy === 'debtDesc') {
    filteredLoans.sort((a, b) => (b.totalDebt || 0) - (a.totalDebt || 0));
  } else if (sortBy === 'debtAsc') {
    filteredLoans.sort((a, b) => (a.totalDebt || 0) - (b.totalDebt || 0));
  } else if (sortBy === 'remainingDesc') {
    filteredLoans.sort((a, b) => (b.remainingAmount || 0) - (a.remainingAmount || 0));
  } else if (sortBy === 'remainingAsc') {
    filteredLoans.sort((a, b) => (a.remainingAmount || 0) - (b.remainingAmount || 0));
  } else if (sortBy === 'dueAsc') {
    filteredLoans.sort((a, b) => {
      if (!a.nextDue) return 1;
      if (!b.nextDue) return -1;
      return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
    });
  }

  // Export report to CSV
  const exportLoansCSV = () => {
    const headers = ["المستفيد", "المعرف", "إجمالي الدين (د.ع)", "المسدد (د.ع)", "المتبقي (د.ع)", "الاستحقاق القادم", "الحالة"];
    const csvContent = [
      headers.join(","),
      ...filteredLoans.map(l => [
        `"${l.borrowerId || 'غير محدد'}"`,
        l.id,
        l.totalDebt || 0,
        l.paidAmount || 0,
        l.remainingAmount || 0,
        l.nextDue ? new Date(l.nextDue).toLocaleDateString('ar-IQ') : 'لا يوجد',
        l.computedStatus === 'completed' ? 'مكتمل' : l.computedStatus === 'late' ? 'متأخر' : 'نشط'
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `تقرير_القروض_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10 relative">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-bold text-center shadow-lg">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>إدارة القروض</span>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
              تسهيلات ائتمانية
            </span>
          </h2>
          <p className="text-sm text-[#737373] mt-1">تتبع وإدارة وسداد التسهيلات الائتمانية النشطة وحالة السداد الفورية.</p>
        </div>
        <button 
          onClick={() => setShowLoanModal(true)} 
          className="flex items-center gap-2 bg-[#10b981] text-black text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#34d399] transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <Plus size={18} />
          <span>إضافة قرض جديد</span>
        </button>
      </div>

      {/* Premium KPI Dashboard with sleek Gradients & Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-[#10b981]/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">إجمالي المديونية النشطة</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight" dir="ltr">
                {totalActiveDebt.toLocaleString()} د.ع
              </h3>
            </div>
            <div className="bg-[#10b981]/10 p-2.5 rounded-lg text-[#10b981] border border-[#10b981]/20 group-hover:scale-110 transition-transform duration-300">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-[#10b981]" />
            <span>إجمالي مستحقات القروض الجارية</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">إجمالي المحصّل (المسدد)</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight text-blue-400" dir="ltr">
                {totalCollected.toLocaleString()} د.ع
              </h3>
            </div>
            <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Coins size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">مجموع الدفعات المسددة فعلياً</p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-amber-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">إجمالي الرصيد المتبقي</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight text-amber-500" dir="ltr">
                {totalRemaining.toLocaleString()} د.ع
              </h3>
            </div>
            <div className="bg-amber-500/10 p-2.5 rounded-lg text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">المبالغ المتبقية قيد التحصيل</p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-red-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">قروض متأخرة/مخاطرة</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight text-red-400" dir="ltr">
                {lateLoansCount}
              </h3>
            </div>
            <div className="bg-red-500/10 p-2.5 rounded-lg text-red-400 border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">تتطلب متابعة وإشعارات استحقاق</p>
        </div>
      </div>

      {/* Main Table View */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#262626] bg-[#141414] shadow-2xl">
        
        {/* Top filter and search control toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between border-b border-[#262626] bg-[#0f0f0f] p-4 gap-4 print:hidden">
          <div className="relative w-full lg:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]" size={16} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#262626] bg-[#1a1a1a] pr-10 pl-4 py-2 text-sm text-[#ededed] focus:border-[#10b981] outline-none transition-colors"
              placeholder="ابحث باسم المستفيد أو المعرف..."
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Live Filter Badges */}
            <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-[#262626]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  filterStatus === 'all' 
                  ? 'bg-[#262626] text-white shadow-sm' 
                  : 'text-[#737373] hover:text-white'
                }`}
              >
                <span>الكل</span>
                <span className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-[10px] font-mono">{loans.length}</span>
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  filterStatus === 'active' 
                  ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 shadow-sm' 
                  : 'text-[#737373] hover:text-white'
                }`}
              >
                <span>نشط</span>
                <span className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-[10px] font-mono">{loans.filter(l => l.computedStatus === 'active').length}</span>
              </button>
              <button
                onClick={() => setFilterStatus('late')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  filterStatus === 'late' 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm' 
                  : 'text-[#737373] hover:text-white'
                }`}
              >
                <span>متأخر</span>
                <span className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-[10px] font-mono">{lateLoansCount}</span>
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  filterStatus === 'completed' 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                  : 'text-[#737373] hover:text-white'
                }`}
              >
                <span>مكتمل</span>
                <span className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-[10px] font-mono">{loans.filter(l => l.computedStatus === 'completed').length}</span>
              </button>
            </div>

            {/* Dynamic Sorting Selection */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-[#737373]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#1a1a1a] py-1.5 px-3 text-xs text-center text-white focus:border-[#10b981] outline-none transition-colors cursor-pointer"
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="debtDesc">إجمالي الدين: الأعلى</option>
                <option value="debtAsc">إجمالي الدين: الأقل</option>
                <option value="remainingDesc">المتبقي: الأعلى</option>
                <option value="remainingAsc">المتبقي: الأقل</option>
                <option value="dueAsc">الأقرب استحقاقاً</option>
              </select>
            </div>

            <div className="h-6 w-px bg-[#262626] hidden sm:block"></div>

            <button 
              onClick={exportLoansCSV}
              className="flex items-center gap-2 text-xs text-[#737373] hover:text-white transition-colors bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-2"
              title="تصدير كشف القروض"
            >
              <Download size={14} />
              <span className="hidden sm:inline">تصدير CSV</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-right">
            <thead className="sticky top-0 border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#737373] z-10">
              <tr>
                <th className="p-4 font-normal">المستفيد</th>
                <th className="p-4 font-normal">إجمالي الدين</th>
                <th className="p-4 font-normal">المسدد</th>
                <th className="p-4 font-normal">المتبقي</th>
                <th className="p-4 font-normal">الاستحقاق القادم</th>
                <th className="p-4 font-normal">الحالة</th>
                <th className="p-4 font-normal text-center print:hidden">إجراء</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {loading ? (
                /* Premium Pulse Skeleton Rows */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#262626] animate-pulse">
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-32"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-20"></div></td>
                    <td className="p-4"><div className="h-5 bg-[#262626] rounded-full w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-12 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in-up">
                      {/* أيقونة بصرية */}
                      <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20">
                          <CreditCard size={28} className="text-[#10b981]" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#10b981]/30 animate-ping" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#ededed]">
                          {loans.length > 0 ? 'لا توجد نتائج مطابقة' : 'لا توجد تسهيلات ائتمانية بعد'}
                        </p>
                        <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto leading-relaxed">
                          {loans.length > 0 
                            ? 'جرّب تعديل كلمة البحث أو تغيير الفلتر المحدد للعثور على القرض المطلوب.'
                            : 'ابدأ رحلة التمويل الآن — أضف أول تسهيل ائتماني وتابع الأقساط والتحصيلات بذكاء.'}
                        </p>
                      </div>
                      {loans.length === 0 && (
                        <button
                          onClick={() => setShowLoanModal(true)}
                          className="flex items-center gap-2 bg-[#10b981] text-black text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#34d399] transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] active:scale-95"
                        >
                          <Plus size={16} />
                          <span>إضافة أول قرض</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const progressPercentage = loan.totalDebt > 0 ? ((loan.paidAmount || 0) / loan.totalDebt) * 100 : 0;
                  
                  return (
                    <tr key={loan.id} className="border-b border-[#262626] transition-all duration-150 hover:bg-[#1a1a1a] group">
                      <td className="p-4 text-white font-sans">
                        <Link href={`/dashboard/borrowers/${encodeURIComponent(loan.borrowerId || '')}`} className="group-hover:text-[#10b981] transition-colors font-bold flex flex-col">
                          <span className="flex items-center gap-2">
                            {loan.borrowerId || 'غير محدد'}
                            {loan.disbursementType === 'cards' ? (
                              <span className="text-[9px] font-sans font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                                📦 عيني ({loan.cardsAllocated} بطاقة)
                              </span>
                            ) : (
                              <span className="text-[9px] font-sans font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                💵 نقدي
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono font-normal">ID: {loan.id.slice(0, 8)}</span>
                        </Link>
                      </td>
                      <td className="p-4 text-[#ededed] font-bold" dir="ltr">{(loan.totalDebt || 0).toLocaleString()} <span className="text-xs text-[#737373] font-normal">د.ع</span></td>
                      <td className="p-4 text-[#10b981]" dir="ltr">
                        <div className="flex flex-col">
                          <span className="font-bold">{(loan.paidAmount || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-[#737373]">{progressPercentage.toFixed(0)}% مسدد</span>
                        </div>
                      </td>
                      <td className="p-4 text-amber-500 font-bold" dir="ltr">{(loan.remainingAmount || 0).toLocaleString()} <span className="text-xs text-[#737373] font-normal">د.ع</span></td>
                      <td className="p-4 text-[#ededed] text-xs">
                        {loan.nextDue ? (
                          <span className={loan.computedStatus === 'late' ? 'text-red-400 font-bold' : ''}>
                            {new Date(loan.nextDue).toLocaleDateString('ar-IQ')}
                          </span>
                        ) : 'لا يوجد'}
                      </td>
                      <td className="p-4">
                        {loan.computedStatus === 'completed' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                            <CheckCircle size={12} /> مكتمل
                          </span>
                        ) : loan.computedStatus === 'late' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 border border-red-500/20 animate-pulse">
                            <AlertTriangle size={12} /> متأخر
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#10b981]/10 px-2.5 py-1 text-xs font-bold text-[#10b981] border border-[#10b981]/20">
                            <TrendingUp size={12} /> نشط
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center print:hidden">
                        <Link 
                          href={`/dashboard/loans/${loan.id}`} 
                          className="inline-block bg-[#262626] hover:bg-[#10b981] text-[#ededed] hover:text-black font-bold px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
                        >
                          إدارة القرض
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modals */}
      {showLoanModal && (
        <NewLoanModal 
          onClose={() => setShowLoanModal(false)} 
          onSuccess={() => {
            setShowLoanModal(false);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}
