'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

type SubscriptionRequest = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedPlan: 'monthly' | 'yearly' | 'percentage';
  paymentMethod: 'cash' | 'whatsapp';
  createdAt: string;
};

export default function BillingPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'percentage'>('monthly');
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'whatsapp'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/subscriptions/me');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setTenant(data.tenant);
        setRequests(data.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/subscriptions/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedPlan: selectedPlan,
          paymentMethod: selectedMethod,
          notes
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setShowModal(false);
      // Refresh logic would go here
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الفواتير والاشتراك</h1>
          <p className="text-[#a3a3a3] text-sm mt-1">إدارة خطة اشتراكك وفواتيرك</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#10b981] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#059669] transition-colors"
        >
          طلب تجديد / ترقية
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-[#141414] border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="text-[#10b981]" size={20} />
            الخطة الحالية
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
              <div>
                <p className="text-[#737373] text-sm">نوع الاشتراك</p>
                <p className="text-white font-bold text-lg mt-1 capitalize">
                  {loading ? 'قيد التحميل...' : (
                    tenant?.subscriptionPlan === 'monthly' ? 'شهرية' :
                    tenant?.subscriptionPlan === 'yearly' ? 'سنوية' :
                    tenant?.subscriptionPlan === 'percentage' ? 'نسبة' :
                    'نسخة تجريبية'
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#737373] text-sm">تاريخ الانتهاء</p>
                <p className="text-white font-mono mt-1">
                  {loading ? '--/--/----' : (
                    tenant?.subscriptionEndDate 
                      ? format(new Date(tenant.subscriptionEndDate), 'yyyy-MM-dd') 
                      : 'غير محدد'
                  )}
                </p>
              </div>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm flex gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>يتم تفعيل وتجديد الاشتراكات بشكل يدوي بعد مراجعة الحوالة عبر زين كاش أو استلام المبلغ نقداً.</p>
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-[#141414] border border-[#262626] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">الطلبات السابقة</h2>
          <div className="space-y-3">
            {loading ? (
               <div className="text-center p-8 text-[#737373] bg-[#1a1a1a] rounded-lg border border-[#262626] border-dashed">
                 جاري التحميل...
               </div>
            ) : requests.length === 0 ? (
              <div className="text-center p-8 text-[#737373] bg-[#1a1a1a] rounded-lg border border-[#262626] border-dashed">
                لا توجد طلبات سابقة
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="p-3 bg-[#1a1a1a] border border-[#262626] rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white capitalize">{req.requestedPlan}</p>
                    <p className="text-xs text-[#737373] mt-0.5">{format(new Date(req.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                  </div>
                  <div>
                    {req.status === 'pending' && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">قيد المراجعة</span>}
                    {req.status === 'approved' && <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">تمت الموافقة</span>}
                    {req.status === 'rejected' && <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs">مرفوض</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#262626] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">طلب تجديد أو ترقية الاشتراك</h3>
              <button onClick={() => setShowModal(false)} className="text-[#737373] hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1.5">الخطة المطلوبة</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#10b981]"
                >
                  <option value="monthly">باقة شهرية (Monthly)</option>
                  <option value="yearly">باقة سنوية (Yearly)</option>
                  <option value="percentage">باقة النسبة (Percentage)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1.5">طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('whatsapp')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                      selectedMethod === 'whatsapp' 
                        ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' 
                        : 'bg-[#1a1a1a] border-[#333] text-[#737373] hover:border-[#555]'
                    }`}
                  >
                    حوالة (واتساب)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('cash')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                      selectedMethod === 'cash' 
                        ? 'bg-[#10b981]/10 border-[#10b981] text-[#10b981]' 
                        : 'bg-[#1a1a1a] border-[#333] text-[#737373] hover:border-[#555]'
                    }`}
                  >
                    نقداً (Cash)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1.5">ملاحظات (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#10b981] min-h-[80px]"
                  placeholder="أدخل أي ملاحظات إضافية..."
                ></textarea>
              </div>

              <div className="p-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs text-[#a3a3a3] leading-relaxed">
                في حال اختيار "حوالة"، يرجى إرسال إشعار الدفع عبر الواتساب إلى رقم الإدارة. 
                سيتم تفعيل الاشتراك فور التأكد من استلام المبلغ.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#262626] text-white py-2 rounded-lg font-bold hover:bg-[#333] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#10b981] text-black py-2 rounded-lg font-bold hover:bg-[#059669] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
