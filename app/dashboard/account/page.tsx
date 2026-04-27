import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">حسابي</h2>
          <p className="text-sm text-[#737373] mt-1">إعدادات ملفك الشخصي</p>
        </div>
      </div>

      <div className="bg-[#141414] border border-[#262626] rounded-lg p-6 max-w-2xl">
        <h3 className="text-lg font-bold text-white mb-6 border-b border-[#262626] pb-3">البيانات الشخصية</h3>
        
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1">الاسم الكامل</p>
            <p className="text-sm text-[#ededed]">{user.fullName || 'غير محدد'}</p>
          </div>
          
          <div>
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1">البريد الإلكتروني</p>
            <p className="text-sm text-[#ededed]" dir="ltr">{user.email || 'غير محدد'}</p>
          </div>

          <div>
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1">رقم الهاتف</p>
            <p className="text-sm text-[#ededed] font-mono" dir="ltr">{user.phoneNumber || 'غير محدد'}</p>
          </div>

          <div>
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1">تاريخ الانضمام</p>
            <p className="text-sm text-[#ededed]">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-IQ') : '-'}
            </p>
          </div>
          
          <div>
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1">الصلاحية</p>
            <p className="text-sm text-[#10b981]">
              {user.role === 'superadmin' ? 'مدير النظام' : 'مدير'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
