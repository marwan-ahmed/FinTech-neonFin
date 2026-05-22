'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Check, X, AlertCircle } from 'lucide-react';

type SubscriptionPlan = {
  id: string;
  name: string;
  type: 'fixed' | 'percentage';
  price: string | null;
  percentageRate: string | null;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
  features: any;
};

export default function SubscriptionPlansManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<'fixed' | 'percentage'>('fixed');
  const [price, setPrice] = useState('');
  const [percentageRate, setPercentageRate] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscription-plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          price: type === 'fixed' ? price : null,
          percentageRate: type === 'percentage' ? percentageRate : null,
          billingCycle,
          features: {}
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create plan');
      }

      setShowForm(false);
      setName('');
      setPrice('');
      setPercentageRate('');
      fetchPlans();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="text-[#10b981]" />
            باقات الاشتراك
          </h2>
          <p className="text-sm text-[#a3a3a3] mt-1">إدارة الباقات المتاحة وتحديد النسب</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] px-4 py-2 rounded-lg font-bold hover:bg-[#10b981]/20 transition-colors"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'إلغاء' : 'باقة جديدة'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-[#1a1a1a] border border-[#262626] rounded-lg space-y-4">
          <h3 className="font-bold text-white mb-2">إضافة باقة جديدة</h3>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">اسم الباقة</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#10b981]"
                placeholder="مثال: الباقة المتقدمة"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">نظام الفوترة</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#10b981]"
              >
                <option value="monthly">شهري</option>
                <option value="yearly">سنوي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-1.5">نوع الدفع</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#10b981]"
              >
                <option value="fixed">مبلغ ثابت</option>
                <option value="percentage">نسبة من القروض</option>
              </select>
            </div>

            {type === 'fixed' ? (
              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1.5">السعر</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#10b981]"
                  placeholder="مثال: 50000"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-[#a3a3a3] mb-1.5">النسبة المئوية (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={percentageRate}
                  onChange={(e) => setPercentageRate(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-white outline-none focus:border-[#10b981]"
                  placeholder="مثال: 2.5"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#10b981] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#059669] transition-colors disabled:opacity-50"
            >
              {submitting ? 'جاري الإضافة...' : 'إضافة الباقة'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center p-8 text-[#737373]">جاري تحميل الباقات...</div>
      ) : plans.length === 0 ? (
        <div className="text-center p-8 text-[#737373] bg-[#1a1a1a] rounded-lg border border-[#262626] border-dashed">
          لا توجد باقات حالياً. قم بإضافة باقة جديدة.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 bg-[#1a1a1a] border border-[#262626] rounded-xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                {plan.isActive && <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">مفعلة</span>}
              </div>
              <div className="space-y-1 mb-4">
                <p className="text-[#a3a3a3] text-sm">الدورة: {plan.billingCycle === 'monthly' ? 'شهري' : 'سنوي'}</p>
                <p className="text-[#a3a3a3] text-sm">النوع: {plan.type === 'fixed' ? 'ثابت' : 'نسبة'}</p>
              </div>
              <div className="text-xl font-bold text-white">
                {plan.type === 'fixed' ? `${plan.price} دينار` : `${plan.percentageRate}%`}
              </div>
              <div className="absolute top-0 right-0 w-1 h-full bg-[#10b981]"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
