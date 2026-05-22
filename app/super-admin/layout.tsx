import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, LogOut } from 'lucide-react';
import AdminSidebarLinks from './AdminSidebarLinks';
import SystemStatus from './SystemStatus';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // SECURITY: Verify both authentication AND superadmin role at the layout level
  if (!user) {
    redirect('/login');
  }
  if (user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden text-[#ededed]">
      {/* Sidebar Navigation */}
      <aside className="w-72 flex flex-col border-r border-[#262626] bg-[#0f0f0f]">
        <div className="flex h-16 flex-shrink-0 items-center gap-2 border-b border-[#262626] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-red-600">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#ededed]">
            NeonFin <span className="text-red-500">Core</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <AdminSidebarLinks />
        </div>

        <div className="p-4 border-t border-[#262626]">
           <div className="flex items-center gap-3 rounded-lg px-3 py-3 bg-red-950/20 border border-red-900/50">
             <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center font-bold">SA</div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium truncate">صلاحيات كاملة</p>
               <p className="text-xs text-red-400 truncate">{user.email}</p>
             </div>
           </div>
           <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full mt-4 py-2 text-sm text-[#a3a3a3] hover:text-white border border-[#262626] rounded-md transition-colors">
              <LogOut className="h-4 w-4" />
              العودة للوحة العادية
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-[#262626] bg-[#0a0a0a] px-8">
            <h2 className="text-base font-bold uppercase tracking-widest text-[#737373] flex items-center gap-2">
              <span className="text-white">التحكم</span> الرئيسي
            </h2>
            <SystemStatus />
        </header>
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}