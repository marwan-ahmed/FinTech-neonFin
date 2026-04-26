'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function KYCPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                {app.riskLevel === 'high' ? (
                  <span className="inline-flex rounded border border-[#ef4444]/50 bg-[#ef4444]/10 px-2 py-0.5 text-[10px] font-medium text-[#ef4444]">
                    عالي المخاطر
                  </span>
                ) : (
                  <span className="inline-flex rounded border border-[#10b981]/50 bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10b981]">
                    منخفض المخاطر
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] text-[#737373] border-t border-[#262626] pt-3 pb-4 flex flex-col gap-1">
                <span>المعرف: {app.id}</span>
                <span>تاريخ التقديم: {new Date(app.submittedAt).toLocaleString('ar-IQ')}</span>
              </div>
              
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 flex justify-center items-center gap-2 rounded bg-[#10b981] py-2 text-xs font-bold text-black transition-colors hover:bg-[#34d399]">
                  <CheckCircle size={14} />
                  اعتماد
                </button>
                <button className="flex-1 flex justify-center items-center gap-2 rounded border border-[#262626] bg-[#1a1a1a] py-2 text-xs font-bold text-white transition-colors hover:bg-[#262626] hover:text-[#ef4444]">
                  <XCircle size={14} />
                  رفض
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
