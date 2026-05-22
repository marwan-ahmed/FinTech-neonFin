'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CalendarClock, CreditCard, Ban } from 'lucide-react';

export default function TenantSubscriptionControls({
  tenantId,
  status,
  subscriptionStatus,
  subscriptionEndDate,
}: {
  tenantId: string;
  status: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addingDays, setAddingDays] = useState(false);
  const [days, setDays] = useState(30);
  
  const handleUpdate = async (data: any) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/super-admin/tenants/${tenantId}/update-subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update');
      router.refresh();
    } catch (error) {
      alert('Error updating tenant');
    } finally {
      setLoading(false);
      setAddingDays(false);
    }
  };

  const handleApprove = () => handleUpdate({ status: 'active' });
  
  const handleAddDays = () => {
    const currentEnd = subscriptionEndDate ? new Date(subscriptionEndDate) : new Date();
    // If expired, start from today
    const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
    baseDate.setDate(baseDate.getDate() + days);
    
    handleUpdate({ 
      subscriptionEndDate: baseDate.toISOString(),
      subscriptionStatus: 'active'
    });
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6">
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-emerald-500" />
        الاشتراكات والموافقات
      </h3>
      
      <div className="flex flex-col gap-6">
        {/* Approval section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-[#262626] rounded-lg bg-[#0a0a0a]">
          <div>
            <h4 className="font-medium text-white">الموافقة على الحساب</h4>
            <p className="text-sm text-[#737373]">
              {status !== 'pending' ? 'هذا الفرع معتمد ويمكنه الوصول إلى المنصة.' : 'هذا الفرع في انتظار موافقتك.'}
            </p>
          </div>
          {status === 'pending' && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              منح الصلاحية
            </button>
          )}
          {status !== 'pending' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
              معتمد
            </span>
          )}
        </div>

        {/* Subscription section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-[#262626] rounded-lg bg-[#0a0a0a]">
          <div>
            <h4 className="font-medium text-white flex items-center gap-2">
              حالة الاشتراك: 
              <span className={`px-2 py-0.5 rounded text-xs uppercase tracking-wider ${
                subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                subscriptionStatus === 'expired' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {subscriptionStatus === 'active' ? 'نشط' : subscriptionStatus === 'expired' ? 'منتهي' : subscriptionStatus}
              </span>
            </h4>
            <p className="text-sm text-[#737373] mt-1 flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              ينتهي في: {subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString() : 'مدى الحياة / غير محدد'}
            </p>
          </div>
          
          {addingDays ? (
            <div className="flex items-center gap-2">
              <select 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-[#141414] border border-[#262626] rounded-md px-3 py-2 text-sm text-white"
              >
                <option value={30}>+30 يوم (شهري)</option>
                <option value={365}>+365 يوم (سنوي)</option>
              </select>
              <button
                onClick={handleAddDays}
                disabled={loading}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors"
              >
                تطبيق
              </button>
              <button
                onClick={() => setAddingDays(false)}
                className="px-3 py-2 bg-[#262626] hover:bg-[#333] text-white font-medium rounded-md transition-colors"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setAddingDays(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-medium rounded-lg transition-colors flex items-center gap-2 border border-blue-500/20"
              >
                <CreditCard className="h-4 w-4" /> تجديد / تمديد
              </button>
              {subscriptionStatus !== 'expired' && (
                <button
                  onClick={() => handleUpdate({ subscriptionStatus: 'expired' })}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-lg transition-colors flex items-center gap-2 border border-red-500/20"
                >
                  <Ban className="h-4 w-4" /> إنهاء الاشتراك
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
