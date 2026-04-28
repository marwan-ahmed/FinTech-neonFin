import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AccountForm from './AccountForm';

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

      <AccountForm user={user} />
    </div>
  );
}
