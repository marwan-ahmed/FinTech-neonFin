'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, FileText, CheckSquare, Square, Eye, FileSignature } from 'lucide-react';

export default function KYCPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    async function getKYC() {
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

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">طلبات التحقق (KYC)</h2>
          <p className="text-sm text-[#737373] mt-1">مراجعة هويات المستثمرين والمقترضين للموافقة أو الرفض.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin text-[#10b981]" />
          </div>
        ) : applications.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[#737373] border border-[#262626] rounded-lg bg-[#141414]">
            لا توجد طلبات معلقة.
          </div>
        ) : (
          applications.map(app => (
            <div key={app.id} className="rounded-lg border border-[#262626] bg-[#141414] p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">{app.name}</h3>
                  <p className="text-xs text-[#737373] mt-1">{app.type}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {app.riskLevel === 'high' ? (
                    <span className="inline-flex rounded border border-[#ef4444]/50 bg-[#ef4444]/10 px-2 py-0.5 text-[10px] font-medium text-[#ef4444]">
                      عالي المخاطر
                    </span>
                  ) : (
                    <span className="inline-flex rounded border border-[#10b981]/50 bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10b981]">
                      منخفض المخاطر
                    </span>
                  )}
                  {app.status === 'approved' && (
                    <span className="inline-flex rounded border border-blue-500/50 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                      معتمد
                    </span>
                  )}
                  {app.status === 'rejected' && (
                    <span className="inline-flex rounded border border-gray-500/50 bg-gray-500/10 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      مرفوض
                    </span>
                  )}
                </div>
              </div>
              <div className="font-mono text-[10px] text-[#737373] border-t border-[#262626] pt-3 pb-4 flex flex-col gap-1">
                <span>المعرف: {app.id}</span>
                <span>تاريخ التقديم: {new Date(app.submittedAt).toLocaleString('ar-IQ')}</span>
              </div>
              
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => setSelectedApp(app)}
                  className="flex-1 flex justify-center items-center gap-2 rounded bg-blue-500/10 border border-blue-500/30 py-2 text-xs font-bold text-blue-400 transition-colors hover:bg-blue-500/20">
                  <FileText size={14} />
                  مراجعة الوثائق
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-xl border border-[#262626] bg-[#141414] shadow-2xl p-6 max-h-full overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-[#262626] pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">مراجعة وثائق التحقق (KYC)</h3>
                <p className="text-sm text-[#737373] mt-1">طالب التسهيل: {selectedApp.name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-[#737373] hover:text-white p-2 bg-[#262626] rounded-full">
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Borrower Documents */}
              <div className="bg-[#0f0f0f] border border-[#262626] rounded p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                  <div className="w-8 h-8 rounded bg-[#10b981]/20 text-[#10b981] flex items-center justify-center">
                    <FileSignature size={18} />
                  </div>
                  <h4 className="font-bold text-[#ededed]">الوثائق المطلوبة للمقترض</h4>
                </div>
                <div className="space-y-3 font-medium text-sm text-[#737373]">
                  {borrowerDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Square size={16} className="text-[#525252] group-hover:text-[#10b981]" />
                        <span>{doc}</span>
                      </div>
                      <button className="text-xs text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <Eye size={14} />
                        معاينة
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantor Documents */}
              <div className="bg-[#0f0f0f] border border-[#262626] rounded p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-[#262626] pb-3">
                  <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <h4 className="font-bold text-[#ededed]">الوثائق المطلوبة للكفيل</h4>
                </div>
                <div className="space-y-3 font-medium text-sm text-[#737373]">
                  {guarantorDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Square size={16} className="text-[#525252] group-hover:text-purple-400" />
                        <span>{doc}</span>
                      </div>
                      <button className="text-xs text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <Eye size={14} />
                        معاينة
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
              <button onClick={() => setSelectedApp(null)} className="px-6 py-2 rounded border border-[#262626] bg-[#1a1a1a] text-white hover:bg-[#262626] font-bold text-sm">
                إغلاق
              </button>
              <button 
                onClick={() => updateStatus(selectedApp.id, 'rejected')} 
                className="flex items-center gap-2 px-6 py-2 rounded border border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-sm">
                <XCircle size={16} />
                رفض المرفقات
              </button>
              <button 
                onClick={() => updateStatus(selectedApp.id, 'approved')} 
                className="flex items-center gap-2 px-6 py-2 rounded bg-[#10b981] text-black hover:bg-[#34d399] font-bold text-sm">
                <CheckCircle size={16} />
                اعتماد وتحقق كامل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
