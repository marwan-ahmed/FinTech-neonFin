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

  if ((session as any).isFrozen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0a0a0a] p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">الحساب مجمد (Frozen Account)</h1>
        <p className="text-[#a3a3a3] max-w-md mb-8">
          عذراً، تم تجميد حساب هذا الفرع من قبل الإدارة. يرجى التواصل مع الدعم الفني أو السوبر آدمن لتفعيل الحساب واستعادة إمكانية الوصول إلى النظام.
        </p>
        <LogoutButton />
      </div>
    );
  }

  if ((session as any).isPending) {
    const selectedPlan = (session as any).selectedPlan || 'monthly';
    const planPrice = (session as any).planPrice || 50000;
    
    const planName = selectedPlan === 'monthly' 
      ? 'الاشتراك الشهري' 
      : selectedPlan === 'yearly' 
        ? 'الاشتراك السنوي' 
        : selectedPlan === 'lifetime' 
          ? 'شراء مدى الحياة' 
          : 'الاشتراك الشهري';

    const planPriceFormatted = Number(planPrice).toLocaleString('ar-IQ');
    const email = session.email || '';
    const messageText = `مرحباً، قمت بالتسجيل في منصة نيون فين بخطة [${planName}] بسعر [${planPriceFormatted}] د.ع، وأرغب بإرسال إثبات الدفع لتفعيل حسابي. البريد المسجَّل: [${email}].`;
    const whatsappUrl = `https://wa.me/9647760776774?text=${encodeURIComponent(messageText)}`;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0a0a0a] p-6 text-center">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
          <div className="w-10 h-10 bg-yellow-500 rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">حسابك قيد المراجعة</h1>
        
        <div className="my-6 p-4 rounded-xl border border-[#262626] bg-[#141414] max-w-md w-full text-right">
          <p className="text-xs text-[#737373] uppercase tracking-wider mb-2">تفاصيل الطلب والاشتراك:</p>
          <div className="flex justify-between items-center py-1.5 border-b border-[#262626]/50">
            <span className="text-xs text-[#737373]">الخطة المختارة:</span>
            <span className="text-sm font-bold text-[#10b981]">{planName}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-[#262626]/50">
            <span className="text-xs text-[#737373]">سعر الاشتراك:</span>
            <span className="text-sm font-mono font-bold text-white">{planPriceFormatted} د.ع</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs text-[#737373]">البريد الإلكتروني:</span>
            <span className="text-xs font-mono text-[#ededed]">{email}</span>
          </div>
        </div>

        <p className="text-[#a3a3a3] max-w-md mb-8 text-sm leading-relaxed">
          تم استلام طلب التسجيل الخاص بك بنجاح. حسابك الآن قيد المراجعة من قبل الإدارة، وسيتم تفعيله خلال مدة أقصاها 48 ساعة **بعد تأكيد استلام الدفع**.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center items-center mb-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#10b981] hover:bg-[#34d399] text-black font-bold py-3 px-6 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 flex justify-center items-center gap-2"
          >
            <span>إرسال إثبات الدفع عبر واتساب</span>
          </a>
          <LogoutButton />
        </div>
      </div>
    );
  }

  if ((session as any).isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0a0a0a] p-6 text-center">
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
          <div className="w-10 h-10 bg-orange-500 rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">الاشتراك منتهي</h1>
        <p className="text-[#a3a3a3] max-w-md mb-8">
          عذراً، لقد انتهت صلاحية اشتراكك في المنصة. يرجى تجديد الاشتراك للتمتع بكافة الصلاحيات واستعادة الوصول للنظام.
        </p>
        <LogoutButton />
      </div>
    );
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
          <DashboardNav role={session.role as string | undefined} />
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

