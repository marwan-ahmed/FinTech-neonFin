import { verifySession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Activity, Users, ShieldAlert, Building2, Settings, Database, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  // Basic check, actual role check happens in the page
  if (!session) {
    redirect('/login');
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
          <nav className="grid gap-2 px-4">
            <p className="px-2 text-xs font-bold uppercase tracking-wider text-[#737373] mb-2">Administration</p>
            
            <Link href="/super-admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-[#262626] text-white">
              <Activity className="h-4 w-4" />
              Platform Overview
            </Link>
            
            <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#a3a3a3] hover:bg-[#262626] hover:text-white transition-colors cursor-not-allowed opacity-50">
              <Building2 className="h-4 w-4" />
              Tenants Management
            </button>
            
            <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#a3a3a3] hover:bg-[#262626] hover:text-white transition-colors cursor-not-allowed opacity-50">
              <Users className="h-4 w-4" />
              Global Users
            </button>

            <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#a3a3a3] hover:bg-[#262626] hover:text-white transition-colors cursor-not-allowed opacity-50">
              <Database className="h-4 w-4" />
              DB Operations
            </button>

            <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#a3a3a3] hover:bg-[#262626] hover:text-white transition-colors cursor-not-allowed opacity-50">
              <Settings className="h-4 w-4" />
              System Settings
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#262626]">
           <div className="flex items-center gap-3 rounded-lg px-3 py-3 bg-red-950/20 border border-red-900/50">
             <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center font-bold">SA</div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium truncate">Root Access</p>
               <p className="text-xs text-red-400 truncate">{session.email}</p>
             </div>
           </div>
           <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full mt-4 py-2 text-sm text-[#a3a3a3] hover:text-white border border-[#262626] rounded-md transition-colors">
              <LogOut className="h-4 w-4" />
              Exit to Normal Dashboard
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-[#262626] bg-[#0a0a0a] px-8">
            <h2 className="text-lg font-semibold">SAAS Central Command</h2>
            <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#a3a3a3]">SYSTEM STATUS:</span>
                <span className="flex items-center gap-1.5 text-green-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    OPERATIONAL
                </span>
            </div>
        </header>
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}