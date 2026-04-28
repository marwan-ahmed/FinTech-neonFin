'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Users, Building, UserCircle, Wallet, Search, Filter, Plus } from 'lucide-react';
import AddInvestorModal from './AddInvestorModal';

export default function InvestmentsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Advanced filters state - Proposal 2
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'retail', 'institutional'

  // KPIs
  const totalCapital = investors.reduce((sum, inv) => sum + (inv.capital || 0), 0);
  const totalInvestors = investors.length;
  const institutionalCount = investors.filter(i => i.type === 'institutional').length;
  const retailCount = investors.filter(i => i.type === 'retail').length;

  const fetchInvestors = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  // Apply filters
  const filteredInvestors = investors.filter(inv => {
    const matchesSearch = inv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesType = filterType === 'all' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">محافظ الاستثمار</h2>
          <p className="text-sm text-[#737373] mt-1">إدارة رؤوس أموال المستثمرين وتتبع المحافظ الاستثمارية.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#10b981] hover:bg-[#34d399] text-black font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">إضافة مستثمر</span>
        </button>
      </div>

      {/* KPI Dashboard - Proposal 1 */}
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

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#262626] bg-[#141414]">
        
        {/* Controls Bar - Proposal 2 */}
        <div className="border-b border-[#262626] bg-[#0f0f0f] p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="البحث باسم المستثمر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-[#262626] bg-[#1a1a1a] py-2 pr-10 pl-4 text-sm text-white focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#737373]" />
            <span className="text-xs text-[#737373] uppercase tracking-widest">تصنيف:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded border border-[#262626] bg-[#1a1a1a] py-2 px-3 text-sm text-center text-white focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors"
            >
              <option value="all">الكل</option>
              <option value="retail">أفراد</option>
              <option value="institutional">مؤسسات</option>
            </select>
          </div>
        </div>

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
              ) : filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#737373]">
                    {investors.length > 0 ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد مستثمرين بعد'}
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#262626] transition-colors hover:bg-[#1a1a1a]">
                    <td className="p-4 text-white font-sans">{inv.name || 'بدون اسم'}</td>
                    <td className="p-4 text-[#737373]">
                      {inv.type === 'institutional' ? (
                         <span className="flex items-center gap-1"><Building size={14} className="text-purple-500"/> مؤسسي</span>
                      ) : (
                         <span className="flex items-center gap-1"><UserCircle size={14} className="text-orange-500"/> أفراد</span>
                      )}
                    </td>
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
      
      <AddInvestorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchInvestors();
        }}
      />
    </div>
  );
}