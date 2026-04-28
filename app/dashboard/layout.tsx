import { verifySession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import DashboardNav from './nav';

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
      <nav className="flex h-16 items-center justify-between border-b border-[#262626] bg-[#0f0f0f] px-6">
        <div className="flex items-center gap-8 h-full">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 scale-75 transform items-center justify-center rounded-sm bg-[#10b981] rotate-45">
              <div className="h-4 w-4 bg-black rotate-[-45deg]"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#ededed]">
              نيون <span className="text-[#10b981]">فين</span>
            </span>
          </div>
          <DashboardNav />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className="text-xs uppercase tracking-widest text-[#737373]">حالة النظام</p>
            <p className="font-mono text-xs text-[#10b981]">متصل • 12ms</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#404040] bg-[#262626] text-sm font-bold text-[#ededed]" title={session.email}>
            {session.email?.substring(0, 2).toUpperCase() || "JD"}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-6 overflow-hidden">
        {children}
      </main>

      {/* Footer Status Bar */}
      <footer className="mt-auto flex h-10 items-center justify-between border-t border-[#262626] bg-[#0f0f0f] px-6 font-mono text-[10px] text-[#525252]">
        <div className="flex gap-6 uppercase">
          <span>Session ID: NEON_SRV_4420</span>
          <span>DB: Firestore DB</span>
          <span>Auth: Firebase Admin SDK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#10b981]">● ENCRYPTED CONNECTION</span>
          <span>v2.1.0-stable</span>
        </div>
      </footer>
    </div>
  );
}
