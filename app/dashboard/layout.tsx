import { verifySession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import DashboardNav from './nav';
import LogoutButton from './LogoutButton';
import NotificationsPopover from '@/components/NotificationsPopover';
import CommandPalette from '@/components/CommandPalette';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-[#0a0a0a]">
      {/* Top Navigation Bar */}
      <nav className="flex h-14 lg:h-16 items-center justify-between border-b border-[#262626] bg-[#0f0f0f] px-4 lg:px-6 gap-3">
        <div className="flex items-center gap-4 lg:gap-8 h-full">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-7 w-7 lg:h-8 lg:w-8 scale-75 transform items-center justify-center rounded-sm bg-[#10b981] rotate-45">
              <div className="h-3.5 w-3.5 lg:h-4 lg:w-4 bg-black rotate-[-45deg]"></div>
            </div>
            <span className="text-lg lg:text-xl font-bold tracking-tight text-[#ededed]">
              نيون <span className="text-[#10b981]">فين</span>
            </span>
          </div>
          <DashboardNav />
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <NotificationsPopover />
          <div className="text-left hidden md:block">
            <p className="text-xs uppercase tracking-widest text-[#737373]">حالة النظام</p>
            <p className="font-mono text-xs text-[#10b981]">متصل • مباشر</p>
          </div>
          <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full border border-[#404040] bg-[#262626] text-xs lg:text-sm font-bold text-[#ededed]" title={session.email}>
            {session.email?.substring(0, 2).toUpperCase() || "JD"}
          </div>
          <LogoutButton />
        </div>
      </nav>

      <CommandPalette />

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 lg:p-6 overflow-hidden">
        {children}
      </main>

      {/* Dynamic Footer Status Bar */}
      <footer className="mt-auto flex h-8 lg:h-10 items-center justify-between border-t border-[#262626] bg-[#0f0f0f] px-4 lg:px-6 font-mono text-[9px] lg:text-[10px] text-[#525252]">
        <div className="flex gap-3 lg:gap-6 uppercase overflow-hidden">
          <span className="hidden sm:inline">المستخدم: {session.email?.split('@')[0] || 'admin'}</span>
          <span className="hidden md:inline">آخر تسجيل: {new Date().toLocaleDateString('ar-IQ')}</span>
          <span>DB: PostgreSQL (Neon)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#10b981]">● اتصال آمن</span>
          <span>v2.1.0</span>
        </div>
      </footer>
    </div>
  );
}

