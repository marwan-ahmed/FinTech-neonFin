'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, FileText, Square, Eye, FileSignature, Search, Plus, AlertTriangle, ShieldCheck, ShieldAlert, Save, X, Sparkles } from 'lucide-react';

export default function KYCPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  // Add KYC Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    type: 'قرض تجاري',
    riskLevel: 'low' as 'low' | 'medium' | 'high'
  });

  // Existing borrowers and investors for quick selection
  const [existingNames, setExistingNames] = useState<{name: string, type: 'borrower' | 'investor'}[]>([]);
  const [loadingNames, setLoadingNames] = useState(false);

  const fetchExistingEntities = async () => {
    setLoadingNames(true);
    try {
      const [loansRes, investorsRes] = await Promise.all([
        fetch('/api/loans').catch(() => null),
        fetch('/api/investors').catch(() => null)
      ]);
      
      const namesList: {name: string, type: 'borrower' | 'investor'}[] = [];
      const seen = new Set<string>();

      if (loansRes?.ok) {
        const loansData = await loansRes.json();
        loansData.forEach((l: any) => {
          if (l.borrowerName && !seen.has(l.borrowerName)) {
            seen.add(l.borrowerName);
            namesList.push({ name: l.borrowerName, type: 'borrower' });
          }
        });
      }

      if (investorsRes?.ok) {
        const investorsData = await investorsRes.json();
        investorsData.forEach((inv: any) => {
          if (inv.name && !seen.has(inv.name)) {
            seen.add(inv.name);
            namesList.push({ name: inv.name, type: 'investor' });
          }
        });
      }

      setExistingNames(namesList);
    } catch (err) {
      console.error("Error fetching existing entities:", err);
    } finally {
      setLoadingNames(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      fetchExistingEntities();
    }
  }, [showAddModal]);

  // Simulated Document Preview state
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  async function getKYC() {
    setLoading(true);
    try {
      const res = await fetch('/api/kyc');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error fetching KYC:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getKYC();
  }, []);

  const borrowerDocs = [
    'البطاقة الموحدة وجهة و ظهر',
    'البطاقة التموينية',
    'بطاقة السكن',
    'عقد موقع'
  ];

  const guarantorDocs = [
    'البطاقة الموحدة وجهة و ظهر',
    'البطاقة التموينية',
    'بطاقة السكن',
    'هوية الدائرة',
    'كتاب استمرارية خدمة'
  ];

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/kyc/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setApplications(apps => apps.map(app => app.id === id ? { ...app, status } : app));
        setSelectedApp(null);
      } else {
        alert('حدث خطأ أثناء تحديث حالة الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          type: addForm.type,
          riskLevel: addForm.riskLevel,
          status: 'pending'
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ name: '', type: 'قرض تجاري', riskLevel: 'low' });
        getKYC();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'فشل إنشاء طلب التحقق');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الإنشاء');
    } finally {
      setCreating(false);
    }
  };

  const simulateDocPreview = (docName: string) => {
    setPreviewDoc(docName);
    setPreviewing(true);
    // Simulate optical scan delay
    setTimeout(() => {
      setPreviewing(false);
    }, 1200);
  };

  // KPIs Calculations
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const highRiskApps = applications.filter(a => a.riskLevel === 'high').length;

  // Filter implementation
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 h-full pb-10 relative">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>طلبات التحقق (KYC)</span>
            <span className="text-xs font-mono bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-2.5 py-0.5 rounded-full">
              تدقيق الهويات والمخاطر
            </span>
          </h2>
          <p className="text-sm text-[#737373] mt-1">مراجعة هويات المستثمرين والمقترضين لضمان الامتثال والحد من المخاطر.</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#10b981] text-black text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#34d399] transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <Plus size={18} />
          <span>إضافة طلب تحقق جديد</span>
        </button>
      </div>

      {/* Premium KPI Dashboard with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-[#737373]/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">إجمالي الطلبات</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight">
                {totalApps}
              </h3>
            </div>
            <div className="bg-[#262626] p-2.5 rounded-lg text-[#ededed] border border-[#737373]/20 group-hover:scale-110 transition-transform duration-300">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">مجموع الملفات المسجلة للتدقيق</p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-amber-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">قيد الانتظار (معلقة)</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight text-amber-500">
                {pendingApps}
              </h3>
            </div>
            <div className="bg-amber-500/10 p-2.5 rounded-lg text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-[10px] text-amber-500/80 border-t border-[#262626]/60 pt-2.5 mt-1 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>تتطلب مراجعة واعتماد الوثائق</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-[#10b981]/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">معتمد ومتحقق منه</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight text-[#10b981]">
                {approvedApps}
              </h3>
            </div>
            <div className="bg-[#10b981]/10 p-2.5 rounded-lg text-[#10b981] border border-[#10b981]/20 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">مطابق لمعايير مكافحة غسيل الأموال</p>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#262626] hover:border-red-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-[#737373] group-hover:text-white/80 transition-colors uppercase tracking-widest font-bold mb-1">تنبيهات عالية المخاطر</p>
              <h3 className="text-2xl font-bold text-white font-mono tracking-tight text-red-400">
                {highRiskApps}
              </h3>
            </div>
            <div className="bg-red-500/10 p-2.5 rounded-lg text-red-400 border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert size={20} />
            </div>
          </div>
          <p className="text-[10px] text-[#737373] border-t border-[#262626]/60 pt-2.5 mt-1">تخضع للتدقيق الصارم والكفالات</p>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between border border-[#262626] bg-[#141414] rounded-xl p-4 gap-4 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]" size={16} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] pr-10 pl-4 py-2 text-sm text-[#ededed] focus:border-[#10b981] outline-none transition-colors"
            placeholder="ابحث باسم صاحب الطلب أو المعرف..."
          />
        </div>

        {/* Live Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0f0f0f] p-1 rounded-lg border border-[#262626] w-full sm:w-auto justify-between overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-[#262626] text-white shadow-sm' : 'text-[#737373] hover:text-white'
            }`}
          >
            <span>الكل</span>
            <span className="bg-[#141414] px-1.5 py-0.2 rounded text-[10px] font-mono">{totalApps}</span>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
              statusFilter === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-[#737373] hover:text-white'
            }`}
          >
            <span>معلقة</span>
            <span className="bg-[#141414] px-1.5 py-0.2 rounded text-[10px] font-mono">{pendingApps}</span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
              statusFilter === 'approved' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 shadow-sm' : 'text-[#737373] hover:text-white'
            }`}
          >
            <span>معتمد</span>
            <span className="bg-[#141414] px-1.5 py-0.2 rounded text-[10px] font-mono">{approvedApps}</span>
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
              statusFilter === 'rejected' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20 shadow-sm' : 'text-[#737373] hover:text-white'
            }`}
          >
            <span>مرفوض</span>
            <span className="bg-[#141414] px-1.5 py-0.2 rounded text-[10px] font-mono">{applications.filter(a => a.status === 'rejected').length}</span>
          </button>
        </div>
      </div>

      {/* Grid of Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          /* Premium Pulse Skeleton Cards */
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#262626] bg-[#141414] p-5 flex flex-col gap-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 bg-[#262626] rounded w-32"></div>
                  <div className="h-3 bg-[#262626] rounded w-20"></div>
                </div>
                <div className="h-4 bg-[#262626] rounded w-16"></div>
              </div>
              <div className="h-8 bg-[#262626]/40 rounded-lg border-t border-[#262626] mt-2"></div>
              <div className="h-9 bg-[#262626] rounded mt-auto"></div>
            </div>
          ))
        ) : filteredApps.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[#737373] border border-[#262626] rounded-xl bg-[#141414] shadow-sm">
            {applications.length > 0 ? 'لا توجد طلبات تحقق مطابقة للبحث أو الفلتر المحدد.' : 'لا توجد طلبات تحقق مسجلة حتى الآن.'}
          </div>
        ) : (
          filteredApps.map(app => (
            <div 
              key={app.id} 
              className={`rounded-xl border transition-all duration-300 p-5 flex flex-col relative overflow-hidden group hover:shadow-xl ${
                app.status === 'approved' 
                ? 'bg-gradient-to-br from-[#141414] to-[#141414] border-[#262626] hover:border-[#10b981]/40' 
                : app.status === 'rejected'
                ? 'bg-[#141414]/70 border-[#262626] opacity-75'
                : 'bg-gradient-to-br from-[#141414] to-[#1a1a1a] border-[#262626] hover:border-amber-500/40 shadow-md'
              }`}
            >
              {/* Top ambient color bar indicator */}
              <div className={`absolute top-0 inset-x-0 h-0.5 ${
                app.status === 'approved' ? 'bg-[#10b981]' : app.status === 'rejected' ? 'bg-gray-600' : 'bg-amber-500 animate-pulse'
              }`} />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white group-hover:text-[#10b981] transition-colors">{app.name}</h3>
                  <p className="text-xs text-[#737373] mt-1 font-sans">{app.type}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  {app.riskLevel === 'high' ? (
                    <span className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                      <ShieldAlert size={10} /> عالي المخاطر
                    </span>
                  ) : app.riskLevel === 'medium' ? (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                      متوسط المخاطر
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-[#10b981]/30 bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-bold text-[#10b981]">
                      <ShieldCheck size={10} /> منخفض المخاطر
                    </span>
                  )}

                  {app.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                      <CheckCircle size={10} /> معتمد
                    </span>
                  ) : app.status === 'rejected' ? (
                    <span className="inline-flex items-center gap-1 rounded border border-gray-500/30 bg-gray-500/10 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                      <XCircle size={10} /> مرفوض
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                      <AlertTriangle size={10} /> معلق
                    </span>
                  )}
                </div>
              </div>

              <div className="font-mono text-[10px] text-[#737373] border-t border-[#262626] pt-3 pb-4 flex flex-col gap-1">
                <span>المعرف: {app.id}</span>
                <span>تاريخ التقديم: {app.createdAt ? new Date(app.createdAt).toLocaleString('ar-IQ') : 'غير متوفر'}</span>
              </div>
              
              <div className="flex gap-3 mt-auto pt-2">
                <button 
                  onClick={() => setSelectedApp(app)}
                  className={`flex-1 flex justify-center items-center gap-1.5 rounded py-2 text-xs font-bold transition-all duration-200 ${
                    app.status === 'pending'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white'
                    : 'bg-[#0f0f0f] border border-[#262626] text-[#ededed] hover:bg-[#262626]'
                  }`}
                >
                  <FileText size={14} />
                  <span>مراجعة الوثائق</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-6 animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-xl border border-[#262626] bg-[#141414] shadow-2xl p-6 max-h-full overflow-y-auto flex flex-col">
            <div className="flex justify-between items-start mb-6 border-b border-[#262626] pb-4 bg-[#141414]">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>مراجعة وثائق التحقق (KYC)</span>
                  <span className="text-xs text-[#10b981] font-mono font-normal bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                    تدقيق فوري
                  </span>
                </h3>
                <p className="text-sm text-[#737373] mt-1 font-bold">طالب التسهيل: <span className="text-white">{selectedApp.name}</span></p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-[#737373] hover:text-white p-2 bg-[#0f0f0f] border border-[#262626] rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 overflow-y-auto pr-1">
              {/* Borrower Documents */}
              <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] flex items-center justify-center">
                    <FileSignature size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">الوثائق المطلوبة للمقترض</h4>
                </div>
                <div className="space-y-2.5 font-medium text-xs text-[#737373]">
                  {borrowerDocs.map((doc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => simulateDocPreview(doc)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-[#262626] bg-[#141414] hover:bg-[#1a1a1a] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Square size={14} className="text-[#525252] group-hover:text-[#10b981] transition-colors" />
                        <span className="text-[#ededed]">{doc}</span>
                      </div>
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Eye size={12} /> معاينة
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantor Documents */}
              <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">الوثائق المطلوبة للكفيل</h4>
                </div>
                <div className="space-y-2.5 font-medium text-xs text-[#737373]">
                  {guarantorDocs.map((doc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => simulateDocPreview(doc)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-[#262626] bg-[#141414] hover:bg-[#1a1a1a] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Square size={14} className="text-[#525252] group-hover:text-purple-400 transition-colors" />
                        <span className="text-[#ededed]">{doc}</span>
                      </div>
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Eye size={12} /> معاينة
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#262626] mt-auto">
              <button 
                onClick={() => setSelectedApp(null)} 
                className="px-5 py-2 rounded-lg border border-[#262626] bg-[#0f0f0f] text-white hover:bg-[#1a1a1a] font-bold text-xs transition-colors"
              >
                إغلاق
              </button>
              <button 
                onClick={() => updateStatus(selectedApp.id, 'rejected')} 
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-colors"
              >
                <XCircle size={14} />
                <span>رفض الوثائق</span>
              </button>
              <button 
                onClick={() => updateStatus(selectedApp.id, 'approved')} 
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#10b981] text-black hover:bg-[#34d399] font-bold text-xs transition-colors"
              >
                <CheckCircle size={14} />
                <span>اعتماد وتحقق كامل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Document Scanning Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#141414] border border-[#262626] rounded-xl max-w-lg w-full p-6 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
            
            {/* Laser Scanning Line Animation */}
            {previewing && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#10b981] to-transparent animate-laser-scan" />
            )}

            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] mb-4 relative">
              {previewing ? (
                <Loader2 size={30} className="animate-spin" />
              ) : (
                <Sparkles size={30} className="animate-pulse" />
              )}
            </div>

            <h4 className="text-white font-bold text-base mb-1">استعراض المرفق الرقمي</h4>
            <p className="text-xs text-[#10b981] font-mono mb-6 bg-[#10b981]/10 px-3 py-1 rounded border border-[#10b981]/20">
              {previewDoc}
            </p>

            {previewing ? (
              <div className="w-full space-y-3 py-6">
                <p className="text-xs text-[#737373]">جاري مسح وتحليل الوثيقة بالأشعة الضوئية للتحقق من الأختام...</p>
                <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10b981] h-full rounded-full animate-progress-indeterminate"></div>
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#0f0f0f] border border-[#262626] rounded-lg p-6 mb-6 flex flex-col items-center justify-center text-xs text-[#737373] min-h-[140px]">
                <FileSignature size={36} className="text-[#525252] mb-2" />
                <p className="text-[#ededed] font-bold mb-1">[صورة المرفق الممسوح ضوئياً بدقة عالية]</p>
                <p className="text-[10px]">تم اجتياز الفحص التلقائي للوثيقة بنجاح.</p>
              </div>
            )}

            <button
              onClick={() => setPreviewDoc(null)}
              disabled={previewing}
              className="w-full py-2.5 rounded-lg bg-[#262626] hover:bg-[#10b981] text-white hover:text-black font-bold text-xs transition-colors disabled:opacity-50"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}

      {/* Add New Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-[#262626] rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-[#262626] bg-[#0f0f0f]">
              <h3 className="font-bold text-white text-base">إضافة طلب تحقق (KYC) جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#737373] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#737373]">اسم طالب التسهيل / المستثمر</label>
                  {loadingNames && <span className="text-[10px] text-[#10b981] animate-pulse">جاري جلب الأسماء المسجلة...</span>}
                </div>
                <input 
                  type="text" 
                  required
                  value={addForm.name}
                  onChange={e => setAddForm({...addForm, name: e.target.value})}
                  className="rounded-lg border border-[#262626] bg-[#0f0f0f] p-2.5 text-sm text-white focus:border-[#10b981] outline-none transition-colors"
                  placeholder="الاسم الكامل مطابقاً للوثائق الرسمية..."
                />
                {existingNames.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1.5 bg-[#0f0f0f] p-2.5 rounded-lg border border-[#262626]">
                    <span className="text-[10px] text-[#737373] font-bold">اختيار سريع من المسجلين مسبقاً:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {existingNames
                        .filter(e => !addForm.name || e.name.toLowerCase().includes(addForm.name.toLowerCase()))
                        .map((entity, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const defaultType = entity.type === 'investor' ? 'محفظة استثمارية' : 'قرض تجاري';
                              setAddForm({ ...addForm, name: entity.name, type: defaultType });
                            }}
                            className={`text-[10px] px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                              addForm.name === entity.name
                                ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981] font-bold'
                                : entity.type === 'borrower'
                                ? 'bg-[#141414] border-[#262626] hover:border-[#10b981]/40 text-[#ededed]'
                                : 'bg-purple-500/5 border-[#262626] hover:border-purple-500/40 text-purple-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${entity.type === 'borrower' ? 'bg-[#10b981]' : 'bg-purple-400'}`}></span>
                            <span>{entity.name}</span>
                            <span className="text-[8px] opacity-60">({entity.type === 'borrower' ? 'مقترض' : 'مستثمر'})</span>
                          </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#737373]">نوع التسهيل / الغرض</label>
                <select
                  value={addForm.type}
                  onChange={e => setAddForm({...addForm, type: e.target.value})}
                  className="rounded-lg border border-[#262626] bg-[#0f0f0f] p-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                >
                  <option value="قرض تجاري">قرض تجاري</option>
                  <option value="قرض شخصي">قرض شخصي</option>
                  <option value="تمويل عقاري">تمويل عقاري</option>
                  <option value="محفظة استثمارية">محفظة استثمارية</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#737373]">مستوى المخاطر التقديري</label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAddForm({...addForm, riskLevel: 'low'})}
                    className={`py-2 rounded border text-xs font-bold transition-all ${
                      addForm.riskLevel === 'low' 
                      ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' 
                      : 'bg-[#0f0f0f] border-[#262626] text-[#737373] hover:text-white'
                    }`}
                  >
                    منخفض
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({...addForm, riskLevel: 'medium'})}
                    className={`py-2 rounded border text-xs font-bold transition-all ${
                      addForm.riskLevel === 'medium' 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                      : 'bg-[#0f0f0f] border-[#262626] text-[#737373] hover:text-white'
                    }`}
                  >
                    متوسط
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({...addForm, riskLevel: 'high'})}
                    className={`py-2 rounded border text-xs font-bold transition-all ${
                      addForm.riskLevel === 'high' 
                      ? 'bg-red-500/10 border-red-500 text-red-400' 
                      : 'bg-[#0f0f0f] border-[#262626] text-[#737373] hover:text-white'
                    }`}
                  >
                    عالي
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-transparent border border-[#262626] text-white font-bold text-xs hover:bg-[#1a1a1a]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creating || !addForm.name.trim()}
                  className="flex-1 py-2.5 rounded-lg bg-[#10b981] text-black font-bold text-xs hover:bg-[#34d399] flex justify-center items-center gap-1.5 disabled:opacity-50"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>حفظ وإنشاء الطلب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
