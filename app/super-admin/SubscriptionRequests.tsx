'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

type Request = {
  id: string;
  tenantId: string;
  tenantName: string;
  requestedPlan: string;
  paymentMethod: string;
  status: string;
  notes: string;
  createdAt: string;
};

export default function SubscriptionRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/subscriptions/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/subscriptions/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Refresh list
        await fetchRequests();
      } else {
        alert('حدث خطأ أثناء معالجة الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-[#737373]">جاري التحميل...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#262626]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="text-yellow-500" size={20} />
            طلبات الاشتراك المعلقة ({pendingRequests.length})
          </h2>
        </div>
        
        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-[#737373]">
            لا توجد طلبات معلقة
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h3 className="text-white font-bold">{req.tenantName}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-[#737373]">
                    <span>الخطة: <span className="text-white capitalize">{req.requestedPlan}</span></span>
                    <span>الدفع: <span className="text-white capitalize">{req.paymentMethod}</span></span>
                    <span>التاريخ: {format(new Date(req.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                  {req.notes && (
                    <p className="mt-2 text-sm text-[#a3a3a3] bg-[#1a1a1a] p-2 rounded">
                      ملاحظات: {req.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={actionLoading === req.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    قبول
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={actionLoading === req.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pastRequests.length > 0 && (
        <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#262626]">
            <h2 className="text-lg font-bold text-white">الطلبات السابقة</h2>
          </div>
          <div className="divide-y divide-[#262626]">
            {pastRequests.slice(0, 10).map(req => (
              <div key={req.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold">{req.tenantName}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-[#737373]">
                    <span>{req.requestedPlan}</span>
                    <span>{req.paymentMethod}</span>
                    <span>{format(new Date(req.createdAt), 'yyyy-MM-dd')}</span>
                  </div>
                </div>
                <div>
                  {req.status === 'approved' ? (
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">تمت الموافقة</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs">مرفوض</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
