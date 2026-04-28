'use client';

import { useState } from 'react';
import { User, Mail, Phone, Save, Loader2, Calendar, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phoneNumber: user.phoneNumber || ''
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('فشل تحديث البيانات');
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-[#141414] border border-[#262626] rounded-lg p-6">
          <div className="mb-6 border-b border-[#262626] pb-4">
             <h3 className="text-lg font-bold text-white mb-1">البيانات الشخصية</h3>
             <p className="text-sm text-[#737373]">قم بتحديث معلوماتك الشخصية من هنا</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#737373] uppercase tracking-widest font-bold">الاسم الكامل</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded border border-[#262626] bg-[#0f0f0f] py-3 pr-10 pl-4 text-white focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#737373] uppercase tracking-widest font-bold">رقم الهاتف</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373]">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded border border-[#262626] bg-[#0f0f0f] py-3 pr-10 pl-4 text-white focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors font-mono text-right"
                  placeholder="أدخل رقم هاتفك"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#737373] uppercase tracking-widest font-bold">البريد الإلكتروني</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373]">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={user.email || ''}
                  readOnly
                  className="w-full rounded border border-[#262626] bg-[#1a1a1a] py-3 pr-10 pl-4 text-[#737373] cursor-not-allowed font-mono text-right"
                  dir="ltr"
                />
              </div>
              <span className="text-[10px] text-[#737373]">لتغيير البريد الإلكتروني، يرجى التواصل مع مسؤول النظام.</span>
            </div>

            {error && <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}
            {success && <div className="text-[#10b981] text-sm font-bold bg-[#10b981]/10 p-3 rounded border border-[#10b981]/20">تم تحديث البيانات بنجاح</div>}

            <div className="pt-2 border-t border-[#262626] flex justify-end">
              <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#10b981] text-black px-6 py-2.5 rounded font-bold hover:bg-[#34d399] transition-colors disabled:opacity-50"
              >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="lg:col-span-1 flex flex-col gap-6">
         <div className="bg-[#141414] border border-[#262626] rounded-lg p-6 flex items-center gap-4">
             <div className="h-16 w-16 rounded-full bg-[#262626] flex items-center justify-center flex-shrink-0">
               <User size={32} className="text-[#737373]" />
             </div>
             <div>
               <h4 className="text-lg font-bold text-white">{user.fullName || 'مستخدم النظام'}</h4>
               <p className="text-sm text-[#737373]">{user.role === 'superadmin' ? 'مدير النظام' : 'مدير'}</p>
             </div>
         </div>
         
         <div className="bg-[#141414] border border-[#262626] rounded-lg p-6">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-[#737373] flex items-center gap-2">
               <Shield size={16} /> لوحة المعلومات
            </h4>
            
            <div className="flex flex-col gap-4">
               <div className="flex justify-between items-center border-b border-[#262626] pb-3">
                 <span className="text-sm text-[#737373]">تاريخ الانضمام</span>
                 <span className="text-sm text-[#ededed] flex items-center gap-2">
                    <Calendar size={14} className="text-[#737373]"/>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-IQ') : '-'}
                 </span>
               </div>
               <div className="flex justify-between items-center pb-1">
                 <span className="text-sm text-[#737373]">معرف الحساب</span>
                 <span className="text-xs text-[#ededed] font-mono bg-[#262626] px-2 py-1 rounded">
                    {user.id.substring(0, 8)}...
                 </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
