'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Users, Building, UserCircle, Wallet, Search, Filter, Plus, Download, Printer, Edit, Trash2, ArrowUpDown, X, Eye, Sparkles, Percent, Coins, FileText, ChevronLeft } from 'lucide-react';
import AddInvestorModal from './AddInvestorModal';
import EditInvestorModal from './EditInvestorModal';
import RiskAllocation from './RiskAllocation';

export default function InvestmentsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<any | null>(null);
  
  // Proposal 5: Selected investor details slide-over drawer
  const [selectedInvestor, setSelectedInvestor] = useState<any | null>(null);
  
  // Advanced filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'retail', 'institutional'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'capitalDesc', 'capitalAsc', 'dateDesc', 'dateAsc'

  // KPIs Calculations
  const totalCapital = investors.reduce((sum, inv) => sum + (inv.capital || 0), 0);
  const totalEarnings = investors.reduce((sum, i) => sum + (Number(i.earnings) || 0), 0);

  const hasTenantInfo = investors.some((i) => i.tenantName);
  const totalInvestors = investors.length;
  const institutionalCount = investors.filter(i => i.type === 'institutional').length;
  const retailCount = investors.filter(i => i.type === 'retail').length;

  // Proposal 3: Projected Yield & ROI calculation
  // Total projected profit from active/approved loans is sum of (totalDebt - assetValue)
  const activeLoansList = loans.filter(l => l.status === 'active' || l.status === 'approved');
  const totalExpectedPortfolioProfit = activeLoansList.reduce((sum, l) => {
    const debt = parseFloat(l.totalDebt || 0);
    const asset = parseFloat(l.assetValue || 0);
    return sum + Math.max(0, debt - asset);
  }, 0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, loansRes] = await Promise.all([
        fetch('/api/investors'),
        fetch('/api/loans')
      ]);
      
      if (invRes.status === 401 || loansRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      
      if (invRes.ok) {
        const data = await invRes.json();
        setInvestors(data.map((i: any) => ({
          ...i,
          capital: parseFloat(i.capital || 0),
          earnings: parseFloat(i.earnings || 0)
        })));
      }
      
      if (loansRes.ok) {
        const data = await loansRes.json();
        setLoans(data.map((l: any) => ({
          ...l,
          totalDebt: parseFloat(l.totalDebt || 0),
          assetValue: parseFloat(l.assetValue || 0)
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

  // Delete investor handler
  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening drawer
    if (!window.confirm(`هل أنت متأكد من حذف المستثمر "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/investors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedInvestor?.id === id) setSelectedInvestor(null);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'فشل حذف المستثمر');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  // Apply filters
  let filteredInvestors = investors.filter(inv => {
    const matchesSearch = inv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesType = filterType === 'all' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  // Apply sorting
  if (sortBy === 'capitalDesc') {
    filteredInvestors.sort((a, b) => (b.capital || 0) - (a.capital || 0));
  } else if (sortBy === 'capitalAsc') {
    filteredInvestors.sort((a, b) => (a.capital || 0) - (b.capital || 0));
  } else if (sortBy === 'dateDesc') {
    filteredInvestors.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } else if (sortBy === 'dateAsc') {
    filteredInvestors.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  }

  // Automated Reporting Export
  const exportToCSV = () => {
    const headers = ["اسم المستثمر", "النوع", "رأس المال (د.ع)", "الأرباح المحققة (د.ع)", "نسبة المساهمة", "العائد المتوقع (د.ع)", "تاريخ الإضافة"];
    const csvContent = [
      headers.join(","),
      ...filteredInvestors.map(inv => {
        const share = totalCapital > 0 ? ((inv.capital || 0) / totalCapital) * 100 : 0;
        const expectedYield = totalCapital > 0 ? ((inv.capital || 0) / totalCapital) * totalExpectedPortfolioProfit : 0;
        return [
          `"${inv.name || 'بدون اسم'}"`,
          inv.type === 'institutional' ? 'مؤسسي' : 'أفراد',
          inv.capital || 0,
          inv.earnings || 0,
          `"${share.toFixed(2)}%"`,
          expectedYield.toFixed(2),
          inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-IQ') : '-'
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `تقرير_المستثمرين_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const printReport = () => {
    window.print();
  };

  const printInvestorReport = () => {
    if (!selectedInvestor) return;
    
    const w = window.open('', '_blank');
    if (!w) {
      alert("يرجى السماح بالنوافذ المنبثقة (Pop-ups) لطباعة التقرير.");
      return;
    }

    const sharePercentage = totalCapital > 0 ? (((selectedInvestor.capital || 0) / totalCapital) * 100).toFixed(2) : '0';
    const expectedYield = totalCapital > 0 ? (((selectedInvestor.capital || 0) / totalCapital) * totalExpectedPortfolioProfit) : 0;
    const totalValue = (selectedInvestor.capital || 0) + parseFloat(selectedInvestor.earnings || 0);

    w.document.write(`
      <html dir="rtl">
      <head>
        <title>كشف حساب مستثمر - ${selectedInvestor.name}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1a1a1a; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #10b981; font-size: 28px; }
          .header p { margin: 5px 0 0 0; color: #737373; font-size: 14px; }
          
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
          .info-col { flex: 1; }
          .info-col p { margin: 8px 0; font-size: 14px; }
          .info-col span { font-weight: bold; color: #111; font-size: 15px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          th, td { border: 1px solid #e5e5e5; padding: 16px; text-align: right; }
          th { background-color: #f3f4f6; color: #374151; font-weight: 600; font-size: 14px; width: 45%; }
          td { font-size: 16px; font-weight: bold; }
          
          .amount { font-family: monospace; }
          .highlight { color: #10b981; }
          
          .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px; }
          
          @media print {
            body { padding: 0; }
            .header { padding-top: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>كشف حساب مستثمر</h1>
          <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-IQ')} - الوقت: ${new Date().toLocaleTimeString('ar-IQ')}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-col">
            <p>اسم المستثمر: <span>${selectedInvestor.name}</span></p>
            <p>معرف النظام (ID): <span>${selectedInvestor.id}</span></p>
          </div>
          <div class="info-col">
            <p>تاريخ الانضمام: <span>${selectedInvestor.createdAt ? new Date(selectedInvestor.createdAt).toLocaleDateString('ar-IQ') : '-'}</span></p>
            <p>نوع المستثمر: <span>${selectedInvestor.type === 'institutional' ? 'مؤسسي' : 'أفراد'}</span></p>
          </div>
        </div>

        <table>
          <tbody>
            <tr>
              <th>رأس المال المُودع الأساسي</th>
              <td class="amount">${(selectedInvestor.capital || 0).toLocaleString()} د.ع</td>
            </tr>
            <tr>
              <th>حصة الملكية في المحفظة</th>
              <td class="amount">${sharePercentage}%</td>
            </tr>
            <tr>
              <th>الأرباح المحققة (التي تم تسليمها)</th>
              <td class="amount highlight">+${parseFloat(selectedInvestor.earnings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ع</td>
            </tr>
            <tr>
              <th>العائد المتوقع مقدراً (مستقبلي)</th>
              <td class="amount" style="color: #3b82f6;">+${expectedYield.toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ع</td>
            </tr>
            <tr style="background-color: #f0fdf4;">
              <th style="color: #166534; font-size: 16px;">القيمة الإجمالية للمحفظة (الحالية)</th>
              <td class="amount" style="color: #166534; font-size: 20px;">${totalValue.toLocaleString()} د.ع</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          هذا الكشف صادر إلكترونياً من نظام "نيون فين" ولا يحتاج إلى توقيع.<br>
          جميع المبالغ المذكورة بالدينار العراقي (IQD).
        </div>
      </body>
      </html>
    `);
    w.document.close();
    
    setTimeout(() => {
      w.print();
    }, 250);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>محافظ الاستثمار</span>
          </h2>
          <p className="text-sm text-[#737373] mt-1">إدارة رؤوس أموال المستثمرين وتتبع المحافظ الاستثمارية مع محاكاة العوائد المتوقعة.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#10b981] hover:bg-[#34d399] text-black font-bold py-2 px-4 rounded transition-transform active:scale-95 duration-150 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">إضافة مستثمر</span>
          </button>
        </div>
      </div>

      {/* KPI Dashboard with sleek Glassmorphism & Micro-interactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-[#10b981]/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">إجمالي رأس المال</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight" dir="ltr">
                {totalCapital.toLocaleString()} د.ع
              </h3>
            </div>
            <div className="bg-[#10b981]/10 p-2.5 rounded-lg text-[#10b981] border border-[#10b981]/20 group-hover:scale-110 transition-transform duration-300">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] flex items-center gap-1.5 border-t border-[#262626]/60 pt-2.5 mt-1">
            <TrendingUp size={12} className="text-[#10b981]" />
            <span>يمثل إجمالي أموال المحفظة النشطة</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">إجمالي المستثمرين</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight" dir="ltr">
                {totalInvestors}
              </h3>
            </div>
            <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Users size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">موزعين بين أفراد ومؤسسات</p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-purple-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">المؤسسات الاستثمارية</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight" dir="ltr">
                {institutionalCount}
              </h3>
            </div>
            <div className="bg-purple-500/10 p-2.5 rounded-lg text-purple-500 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <Building size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">الكيانات الاعتبارية والشركات</p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-orange-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">مستثمرون أفراد</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight" dir="ltr">
                {retailCount}
              </h3>
            </div>
            <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-500 border border-orange-500/20 group-hover:scale-110 transition-transform duration-300">
              <UserCircle size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">مستثمرون من فئة الأفراد (Retail)</p>
        </div>
      </div>

      {/* Projected Portfolio Yield Preview Card */}
      {totalExpectedPortfolioProfit > 0 && (
        <div className="bg-gradient-to-r from-[#10b981]/10 via-transparent to-transparent border border-[#10b981]/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981]/20 p-2 rounded-lg text-[#10b981]">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>إجمالي العوائد المتوقعة للمحفظة النشطة</span>
                <span className="text-[10px] bg-[#10b981] text-black px-1.5 py-0.5 rounded font-mono font-bold">محاكاة فورية</span>
              </h4>
              <p className="text-xs text-[#737373] mt-0.5">مبني على إجمالي هوامش الفوائد المقدرة للقروض الجارية حالياً.</p>
            </div>
          </div>
          <div className="text-left font-mono">
            <span className="text-lg font-bold text-[#10b981]">+{totalExpectedPortfolioProfit.toLocaleString()}</span>
            <span className="text-xs text-[#737373] ml-1">د.ع</span>
          </div>
        </div>
      )}

      {/* Risk & Asset Allocation */}
      {!loading && <RiskAllocation investors={investors} loans={loans} />}

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#262626] bg-[#141414] shadow-xl">
        
        {/* Controls Bar with Visual Filter Badges */}
        <div className="border-b border-[#262626] bg-[#0f0f0f] p-4 flex flex-col lg:flex-row gap-4 justify-between items-center print:hidden">
          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="البحث باسم المستثمر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#262626] bg-[#1a1a1a] py-2 pr-10 pl-4 text-sm text-white focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Premium Filter Tabs Badges */}
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] p-1 rounded-lg border border-[#262626]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  filterType === 'all' 
                  ? 'bg-[#262626] text-white shadow-sm' 
                  : 'text-[#737373] hover:text-white'
                }`}
              >
                <span>الكل</span>
                <span className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-[10px] font-mono">{investors.length}</span>
              </button>
              <button
                onClick={() => setFilterType('retail')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  filterType === 'retail' 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm' 
                  : 'text-[#737373] hover:text-white'
                }`}
              >
                <span>أفراد</span>
                <span className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-[10px] font-mono">{investors.filter(i => i.type === 'retail').length}</span>
              </button>
              <button
                onClick={() => setFilterType('institutional')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  filterType === 'institutional' 
                  ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-sm' 
                  : 'text-[#737373] hover:text-white'
                }`}
              >
                <span>مؤسسات</span>
                <span className="bg-[#0f0f0f] px-1.5 py-0.5 rounded text-[10px] font-mono">{investors.filter(i => i.type === 'institutional').length}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-[#737373]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-[#262626] bg-[#1a1a1a] py-1.5 px-3 text-xs text-center text-white focus:border-[#10b981] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="default">ترتيب الافتراضي</option>
                <option value="capitalDesc">رأس المال: الأعلى</option>
                <option value="capitalAsc">رأس المال: الأقل</option>
                <option value="dateDesc">الأحدث انضماماً</option>
                <option value="dateAsc">الأقدم انضماماً</option>
              </select>
            </div>
            
            <div className="h-6 w-px bg-[#262626] hidden sm:block"></div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 text-xs text-[#737373] hover:text-[#10b981] transition-colors bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-2"
                title="تصدير كملف إكسل (CSV)"
              >
                <Download size={14} />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button 
                onClick={printReport}
                className="flex items-center gap-2 text-xs text-[#737373] hover:text-white transition-colors bg-[#1a1a1a] border border-[#262626] rounded-lg px-3 py-2"
                title="طباعة التقرير (PDF)"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-right">
            <thead className="sticky top-0 border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#737373] z-10">
              <tr>
                {hasTenantInfo && <th className="p-4 font-normal text-[#10b981]">الفرع (التاجر)</th>}
                <th className="p-4 font-normal">المستثمر</th>
                <th className="p-4 font-normal">نوع المستثمر</th>
                <th className="p-4 font-normal">رأس المال المُودع</th>
                <th className="p-4 font-normal">نسبة المساهمة</th>
                <th className="p-4 font-normal">الأرباح المحققة 💰</th>
                <th className="p-4 font-normal">العائد المتوقع 🌟</th>
                <th className="p-4 font-normal">تاريخ الانضمام</th>
                <th className="p-4 font-normal text-center print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {loading ? (
                /* Proposal 4: Premium Skeleton Loading Structure */
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#262626] animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#262626]"></div>
                        <div className="h-4 bg-[#262626] rounded w-32"></div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-28"></div></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="h-3 bg-[#262626] rounded w-8"></div>
                        <div className="w-12 h-1.5 bg-[#262626] rounded-full"></div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 bg-[#10b981]/10 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#262626] rounded w-20"></div></td>
                    <td className="p-4"><div className="h-6 bg-[#262626] rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={hasTenantInfo ? 8 : 7} className="p-12 text-center text-[#737373]">
                    {investors.length > 0 ? 'لا توجد نتائج مطابقة للبحث أو التصنيف المحدد' : 'لا يوجد مستثمرين مسجلين في المحفظة بعد'}
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((inv) => {
                  const sharePercentage = totalCapital > 0 ? ((inv.capital || 0) / totalCapital) * 100 : 0;
                  // Individual projected return
                  const expectedYield = totalCapital > 0 ? ((inv.capital || 0) / totalCapital) * totalExpectedPortfolioProfit : 0;
                  
                  return (
                    <tr 
                      key={inv.id} 
                      onClick={() => setSelectedInvestor(inv)}
                      className="border-b border-[#262626] transition-all duration-200 hover:bg-[#1a1a1a] cursor-pointer group"
                    >
                      {hasTenantInfo && (
                        <td className="p-4 text-[#10b981] font-bold text-xs truncate max-w-[120px]" title={inv.tenantName}>
                          {inv.tenantName || '—'}
                        </td>
                      )}
                      <td className="p-4 text-white font-sans font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-xs font-mono text-[#10b981] group-hover:bg-[#10b981]/10 transition-colors">
                          {inv.name ? inv.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <div className="group-hover:text-[#10b981] transition-colors">{inv.name || 'بدون اسم'}</div>
                          <span className="text-[10px] text-[#737373] block font-mono">ID: {inv.id.slice(0, 6)}...</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#737373]">
                        {inv.type === 'institutional' ? (
                           <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-xs">
                             <Building size={12} /> مؤسسي
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-xs">
                             <UserCircle size={12} /> أفراد
                           </span>
                        )}
                      </td>
                      <td className="p-4 text-white font-bold" dir="ltr">{(inv.capital || 0).toLocaleString()} <span className="text-xs text-[#737373] font-normal">د.ع</span></td>
                      <td className="p-4 text-[#ededed]">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs font-bold">{sharePercentage.toFixed(1)}%</span>
                          <div className="w-12 bg-[#262626] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#10b981] h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, sharePercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4" dir="ltr">
                        {(inv.earnings || 0) > 0 ? (
                          <span className="text-[#10b981] font-bold bg-[#10b981]/10 px-2 py-1 rounded text-xs border border-[#10b981]/20 inline-flex items-center gap-1">
                            <Coins size={12} />
                            +{inv.earnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ع
                          </span>
                        ) : (
                          <span className="text-[#737373] text-xs">0 د.ع</span>
                        )}
                      </td>
                      <td className="p-4" dir="ltr">
                        {expectedYield > 0 ? (
                          <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded text-xs border border-blue-500/20 inline-block">
                            +{expectedYield.toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ع
                          </span>
                        ) : (
                          <span className="text-[#737373] text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4 text-[#ededed] text-xs">
                         {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-IQ') : '-'}
                      </td>
                      <td className="p-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedInvestor(inv)}
                            className="p-1.5 text-[#737373] hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
                            title="عرض لوحة التفاصيل"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setEditingInvestor(inv)}
                            className="p-1.5 text-[#737373] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(inv.id, inv.name || '', e)}
                            className="p-1.5 text-[#737373] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal 5: Selected Investor Slide-over Details Panel */}
      {selectedInvestor && (
        <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-[#141414] border-r border-[#262626] shadow-2xl flex flex-col animate-slide-in-left backdrop-blur-xl">
          <div className="p-5 border-b border-[#262626] bg-[#0f0f0f] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedInvestor(null)}
                className="text-[#737373] hover:text-white transition-colors p-1"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-bold text-white text-base">الملف الاستثماري الفردي</h3>
            </div>
            <button 
              onClick={() => setSelectedInvestor(null)}
              className="text-[#737373] hover:text-white p-1 rounded-full hover:bg-[#262626] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
            {/* Header info */}
            <div className="flex flex-col items-center text-center bg-gradient-to-b from-[#1a1a1a] to-transparent p-5 rounded-xl border border-[#262626]">
              <div className="w-16 h-16 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-2xl font-bold text-[#10b981] mb-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {selectedInvestor.name?.charAt(0)}
              </div>
              <h4 className="text-lg font-bold text-white">{selectedInvestor.name}</h4>
              <p className="text-xs text-[#737373] font-mono mt-1">ID: {selectedInvestor.id}</p>
              
              <div className="mt-3">
                {selectedInvestor.type === 'institutional' ? (
                   <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/20">
                     مستثمر مؤسسي (Institutional)
                   </span>
                ) : (
                   <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/20">
                     مستثمر أفراد (Retail)
                   </span>
                )}
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="flex flex-col gap-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#737373]">مؤشرات المساهمة الفردية</h5>
              
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#262626] flex justify-between items-center">
                <span className="text-xs text-[#737373] flex items-center gap-1.5">
                  <Coins size={15} className="text-[#10b981]"/> رأس المال المُودع
                </span>
                <span className="font-mono font-bold text-white text-sm" dir="ltr">
                  {(selectedInvestor.capital || 0).toLocaleString()} د.ع
                </span>
              </div>

              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#262626] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#737373] flex items-center gap-1.5">
                    <Percent size={15} className="text-blue-400"/> حصة الملكية في المحفظة
                  </span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {totalCapital > 0 ? (((selectedInvestor.capital || 0) / totalCapital) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="w-full bg-[#0f0f0f] h-2 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${totalCapital > 0 ? ((selectedInvestor.capital || 0) / totalCapital) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* 💰 Actual Collected Profits Box */}
              <div className="bg-gradient-to-r from-[#10b981]/15 to-[#1a1a1a] p-4 rounded-xl border border-[#10b981]/30 flex flex-col gap-1.5">
                <span className="text-xs text-[#10b981] font-bold flex items-center gap-1.5">
                  <Coins size={15} /> الأرباح المحققة (الفعلي) 💰
                </span>
                <span className="font-mono font-bold text-white text-base" dir="ltr">
                  +{parseFloat(selectedInvestor.earnings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ع
                </span>
                <p className="text-[10px] text-[#737373] mt-1">إجمالي الأرباح الفعلية التي تم تحصيلها وتوزيعها على المستثمر من أقساط المقترضين المسددة.</p>
              </div>

              {/* 🌟 Expected Yield ROI Box */}
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#262626] flex flex-col gap-1.5">
                <span className="text-xs text-blue-400 font-bold flex items-center gap-1.5">
                  <Sparkles size={15} /> العائد المتوقع مقدراً (ROI) 🌟
                </span>
                <span className="font-mono font-bold text-white text-base" dir="ltr">
                  +{totalCapital > 0 ? (((selectedInvestor.capital || 0) / totalCapital) * totalExpectedPortfolioProfit).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0} د.ع
                </span>
                <p className="text-[10px] text-[#737373] mt-1">حصة المستثمر المقدرة من عوائد وفوائد القروض النشطة حالياً في النظام.</p>
              </div>

              {/* 📈 Total Portfolio Value Box */}
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#262626] flex justify-between items-center">
                <span className="text-xs text-[#ededed] font-bold flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-[#10b981]"/> القيمة الحالية الإجمالية للمحفظة
                </span>
                <span className="font-mono font-bold text-white text-sm" dir="ltr">
                  {((selectedInvestor.capital || 0) + parseFloat(selectedInvestor.earnings || 0)).toLocaleString()} د.ع
                </span>
              </div>

              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#262626] flex justify-between items-center">
                <span className="text-xs text-[#737373]">تاريخ الانضمام للمحفظة</span>
                <span className="font-mono text-xs text-white">
                  {selectedInvestor.createdAt ? new Date(selectedInvestor.createdAt).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-[#262626]">
              <button
                onClick={() => {
                  setEditingInvestor(selectedInvestor);
                }}
                className="w-full py-2.5 rounded-lg bg-[#262626] hover:bg-[#333] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Edit size={14} />
                <span>تعديل بيانات المستثمر</span>
              </button>
              <button
                onClick={printInvestorReport}
                className="w-full py-2.5 rounded-lg bg-transparent border border-[#262626] hover:border-[#737373] text-[#737373] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FileText size={14} />
                <span>طباعة تقرير كشف الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AddInvestorModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchData();
        }}
      />

      <EditInvestorModal 
        isOpen={!!editingInvestor}
        onClose={() => setEditingInvestor(null)}
        onSuccess={() => {
          setEditingInvestor(null);
          // Refresh details state if open
          fetchData();
        }}
        investor={editingInvestor}
      />
    </div>
  );
}