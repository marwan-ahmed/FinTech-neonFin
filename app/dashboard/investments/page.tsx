'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Users, Building, UserCircle, Wallet, Search, Filter, Plus, Download, Printer, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import AddInvestorModal from './AddInvestorModal';
import EditInvestorModal from './EditInvestorModal';
import RiskAllocation from './RiskAllocation';

export default function InvestmentsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<any | null>(null);
  
  // Advanced filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'retail', 'institutional'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'capitalDesc', 'capitalAsc', 'dateDesc', 'dateAsc'

  // KPIs
  const totalCapital = investors.reduce((sum, inv) => sum + (inv.capital || 0), 0);
  const totalInvestors = investors.length;
  const institutionalCount = investors.filter(i => i.type === 'institutional').length;
  const retailCount = investors.filter(i => i.type === 'retail').length;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, loansRes] = await Promise.all([
        fetch('/api/investors'),
        fetch('/api/loans')
      ]);
      
      if (invRes.ok) {
        const data = await invRes.json();
        setInvestors(data.map((i: any) => ({
          ...i,
          capital: parseFloat(i.capital || 0)
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
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستثمر "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/investors/${id}`, { method: 'DELETE' });
      if (res.ok) {
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

  // Automated Reporting
  const exportToCSV = () => {
    const headers = ["اسم المستثمر", "النوع", "رأس المال (د.ع)", "نسبة المساهمة", "تاريخ الإضافة"];
    const csvContent = [
      headers.join(","),
      ...filteredInvestors.map(inv => {
        const share = totalCapital > 0 ? ((inv.capital || 0) / totalCapital) * 100 : 0;
        return [
          `"${inv.name || 'بدون اسم'}"`,
          inv.type === 'institutional' ? 'مؤسسي' : 'أفراد',
          inv.capital || 0,
          `"${share.toFixed(2)}%"`,
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

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">محافظ الاستثمار</h2>
          <p className="text-sm text-[#737373] mt-1">إدارة رؤوس أموال المستثمرين وتتبع المحافظ الاستثمارية.</p>
        </div>
        <div className="flex gap-2">
          {investors.length === 0 && !loading && (
            <button 
              onClick={() => {
                setInvestors([
                  { id: '1', name: 'شركة أفق للتجارة', type: 'institutional', capital: 50000000, createdAt: new Date(Date.now() - 30 * 86400000) },
                  { id: '2', name: 'أحمد محمود', type: 'retail', capital: 15000000, createdAt: new Date(Date.now() - 15 * 86400000) },
                  { id: '3', name: 'مؤسسة الرواد', type: 'institutional', capital: 120000000, createdAt: new Date(Date.now() - 60 * 86400000) },
                  { id: '4', name: 'سالم عبدالله', type: 'retail', capital: 5000000, createdAt: new Date() }
                ]);
                setLoans([
                  { id: 'l1', borrowerId: 'b1', totalDebt: 45000000, assetValue: 45000000, status: 'active', score: 'A', nextDue: new Date(Date.now() + 5 * 86400000) },
                  { id: 'l2', borrowerId: 'b2', totalDebt: 25000000, assetValue: 25000000, status: 'defaulted', score: 'C', nextDue: new Date(Date.now() - 10 * 86400000) },
                  { id: 'l3', borrowerId: 'b3', totalDebt: 10000000, assetValue: 10000000, status: 'active', score: 'B', nextDue: new Date(Date.now() + 2 * 86400000) }
                ]);
              }}
              className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold py-2 px-4 rounded transition-colors text-sm"
            >
              توليد بيانات تجريبية (للعرض)
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#10b981] hover:bg-[#34d399] text-black font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">إضافة مستثمر</span>
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] uppercase tracking-widest font-bold mb-1">إجمالي رأس المال</p>
              <h3 className="text-2xl font-bold text-white font-mono" dir="ltr">
                {totalCapital.toLocaleString()} د.ع
              </h3>
            </div>
            <div className="bg-[#10b981]/10 p-2 rounded text-[#10b981]">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] flex items-center gap-1">
            <TrendingUp size={12} className="text-[#10b981]" />
            يمثل إجمالي الاستثمارات النشطة
          </p>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] uppercase tracking-widest font-bold mb-1">إجمالي المستثمرين</p>
              <h3 className="text-2xl font-bold text-white font-mono" dir="ltr">
                {totalInvestors}
              </h3>
            </div>
            <div className="bg-blue-500/10 p-2 rounded text-blue-500">
              <Users size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373]">موزعين بين أفراد ومؤسسات</p>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] uppercase tracking-widest font-bold mb-1">المؤسسات الاستثمارية</p>
              <h3 className="text-2xl font-bold text-white font-mono" dir="ltr">
                {institutionalCount}
              </h3>
            </div>
            <div className="bg-purple-500/10 p-2 rounded text-purple-500">
              <Building size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373]">الكيانات الاعتبارية والشركات</p>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] uppercase tracking-widest font-bold mb-1">مستثمرون أفراد</p>
              <h3 className="text-2xl font-bold text-white font-mono" dir="ltr">
                {retailCount}
              </h3>
            </div>
            <div className="bg-orange-500/10 p-2 rounded text-orange-500">
              <UserCircle size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373]">مستثمرون من فئة الأفراد (Retail)</p>
        </div>
      </div>

      {/* Risk & Asset Allocation */}
      {!loading && <RiskAllocation investors={investors} loans={loans} />}

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#262626] bg-[#141414]">
        
        {/* Controls Bar */}
        <div className="border-b border-[#262626] bg-[#0f0f0f] p-4 flex flex-col lg:flex-row gap-4 justify-between items-center print:hidden">
          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="البحث باسم المستثمر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-[#262626] bg-[#1a1a1a] py-2 pr-10 pl-4 text-sm text-white focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#737373]" />
              <span className="text-xs text-[#737373] uppercase tracking-widest hidden sm:inline">تصنيف:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded border border-[#262626] bg-[#1a1a1a] py-1.5 px-3 text-xs text-center text-white focus:border-[#10b981] focus:outline-none transition-colors"
              >
                <option value="all">الكل</option>
                <option value="retail">أفراد</option>
                <option value="institutional">مؤسسات</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-[#737373]" />
              <span className="text-xs text-[#737373] uppercase tracking-widest hidden sm:inline">ترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded border border-[#262626] bg-[#1a1a1a] py-1.5 px-3 text-xs text-center text-white focus:border-[#10b981] focus:outline-none transition-colors"
              >
                <option value="default">الافتراضي</option>
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
                className="flex items-center gap-2 text-xs text-[#737373] hover:text-[#10b981] transition-colors bg-[#1a1a1a] border border-[#262626] rounded px-3 py-2"
                title="تصدير كملف إكسل (CSV)"
              >
                <Download size={14} />
                <span className="hidden sm:inline">تصدير CSV</span>
              </button>
              <button 
                onClick={printReport}
                className="flex items-center gap-2 text-xs text-[#737373] hover:text-white transition-colors bg-[#1a1a1a] border border-[#262626] rounded px-3 py-2"
                title="طباعة التقرير (PDF)"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">طباعة PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-right">
            <thead className="sticky top-0 border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#737373] z-10">
              <tr>
                <th className="p-4 font-normal">المستثمر</th>
                <th className="p-4 font-normal">نوع المستثمر</th>
                <th className="p-4 font-normal">رأس المال المُودع (دينار)</th>
                <th className="p-4 font-normal">نسبة المساهمة</th>
                <th className="p-4 font-normal">تاريخ الانضمام</th>
                <th className="p-4 font-normal text-center print:hidden">إجراءات</th>
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
              ) : filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#737373]">
                    {investors.length > 0 ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد مستثمرين بعد'}
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((inv) => {
                  const sharePercentage = totalCapital > 0 ? ((inv.capital || 0) / totalCapital) * 100 : 0;
                  return (
                    <tr key={inv.id} className="border-b border-[#262626] transition-colors hover:bg-[#1a1a1a]">
                      <td className="p-4 text-white font-sans font-bold">{inv.name || 'بدون اسم'}</td>
                      <td className="p-4 text-[#737373]">
                        {inv.type === 'institutional' ? (
                           <span className="flex items-center gap-1"><Building size={14} className="text-purple-500"/> مؤسسي</span>
                        ) : (
                           <span className="flex items-center gap-1"><UserCircle size={14} className="text-orange-500"/> أفراد</span>
                        )}
                      </td>
                      <td className="p-4 text-[#10b981] font-bold" dir="ltr">{(inv.capital || 0).toLocaleString()} د.ع</td>
                      <td className="p-4 text-[#ededed]">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs">{sharePercentage.toFixed(1)}%</span>
                          <div className="w-12 bg-[#262626] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#10b981] h-full rounded-full" 
                              style={{ width: `${Math.min(100, sharePercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[#ededed]">
                         {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-IQ') : '-'}
                      </td>
                      <td className="p-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingInvestor(inv)}
                            className="p-1.5 text-[#737373] hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                            title="تعديل"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id, inv.name || '')}
                            className="p-1.5 text-[#737373] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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
          fetchData();
        }}
        investor={editingInvestor}
      />
    </div>
  );
}