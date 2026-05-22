import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Settings, Terminal, Shield, Globe, Cpu, HardDrive, Radio, ToggleLeft, CheckSquare } from "lucide-react";

export default async function SystemSettingsPage() {
  const user = await getCurrentUser();

  // SECURITY PRIME DIRECTIVE
  if (!user || user.role !== 'superadmin') {
    notFound();
  }

  // Diagnostic properties read from server runtime environment
  const diagnostics = [
    { key: 'بيئة التشغيل', val: process.env.NODE_ENV || 'production', icon: Terminal },
    { key: 'خادم التطبيق', val: 'Next.js 15.4 (Vercel)', icon: Globe },
    { key: 'المحرك الأساسي', val: process.version || 'Node v20.x', icon: Cpu },
    { key: 'مستوى المنصة', val: 'Enterprise / Multi-tenant', icon: HardDrive },
  ];

  // Global system configurations toggles visual
  const featureFlags = [
    { name: 'التسجيل العام (ذاتي)', desc: 'يسمح للشركات بإنشاء حساباتهم بأنفسهم.', active: false },
    { name: 'وضع التحقق الصارم (KYC)', desc: 'يمنع الموافقة على القروض قبل التحقق من الهوية.', active: true },
    { name: 'اتصالات حية (WebSockets)', desc: 'بث الإشعارات للأنشطة المالية بشكل حي.', active: true },
    { name: 'سجلات تدقيق غير قابلة للتعديل', desc: 'يفرض تسجيل التغييرات الإدارية لضمان عدم تلاعبها.', active: true },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1 text-xs text-[#737373] uppercase font-bold tracking-widest">
          <Settings className="h-3 w-3 text-red-500" />
          <span>البنية التحتية والتشغيلية</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات النظام</h1>
        <p className="text-[#a3a3a3] mt-2">ضبط إعدادات المنصة، قواعد الامتثال، ومقاييس الأداء.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Section 1: Environment & Diagnostics Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Platform Runtime Card */}
          <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] overflow-hidden shadow-md">
            <div className="p-5 border-b border-[#262626] bg-[#141414] flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-[#262626] flex items-center justify-center flex-shrink-0">
                <Radio className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-white">تشخيص بيئة التشغيل</h3>
                <p className="text-xs text-[#737373] mt-0.5">متغيرات الخادم وبيئة التشغيل الأساسية.</p>
              </div>
            </div>

            <div className="divide-y divide-[#262626]">
              {diagnostics.map((diag) => {
                const Icon = diag.icon;
                return (
                  <div key={diag.key} className="flex items-center justify-between px-6 py-4 hover:bg-[#141414] transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[#525252]" />
                      <span className="text-sm text-[#a3a3a3] font-medium">{diag.key}</span>
                    </div>
                    <span className="text-xs font-mono text-white bg-[#1a1a1a] px-2.5 py-1 rounded border border-[#262626]">
                      {diag.val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Global Feature Toggles Control */}
          <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] overflow-hidden shadow-md">
            <div className="p-5 border-b border-[#262626] bg-[#141414] flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-[#262626] flex items-center justify-center flex-shrink-0">
                <ToggleLeft className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ميزات المنصة</h3>
                <p className="text-xs text-[#737373] mt-0.5">تفعيل وتعطيل الميزات وخصائص التسجيل.</p>
              </div>
            </div>

            <div className="divide-y divide-[#262626]">
              {featureFlags.map((flag) => (
                <div key={flag.name} className="flex items-start justify-between px-6 py-5 hover:bg-[#141414] transition-colors gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{flag.name}</p>
                    <p className="text-xs text-[#737373] leading-relaxed">{flag.desc}</p>
                  </div>
                  {/* Fake iOS/Mac toggle visual */}
                  <div className={`w-10 h-5 rounded-full flex items-center p-0.5 shrink-0 border transition-colors ${
                    flag.active 
                      ? 'bg-red-600/20 border-red-600/40' 
                      : 'bg-[#1a1a1a] border-[#262626]'
                  }`}>
                    <div className={`h-3.5 w-3.5 rounded-full shadow-sm transition-transform ${
                      flag.active 
                        ? 'bg-red-500 translate-x-5' 
                        : 'bg-[#525252] translate-x-0'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Section 2: Platform Global Security Policies */}
        <div className="space-y-6">
          
          <div className="rounded-xl border border-red-900/20 bg-[#0f0a0a] p-6 shadow-md relative overflow-hidden group">
            {/* Visual Top Right Icon Background Glow */}
            <Shield className="absolute -top-6 -right-6 h-32 w-32 text-red-600/5 group-hover:text-red-600/10 transition-colors duration-700 rotate-12 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded bg-red-950/30 border border-red-900/40 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="font-semibold text-white">سياسات أمان المنصة</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#141111] p-3 rounded border border-red-900/10">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#737373] mb-1">مفتاح المصادقة</p>
                <p className="text-xs text-white font-mono">Firebase Admin SDK (Session Cookies)</p>
              </div>

              <div className="bg-[#141111] p-3 rounded border border-red-900/10">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#737373] mb-1">مدة الجلسة الافتراضية</p>
                <p className="text-xs text-white font-mono">5 أيام (تجديد تلقائي)</p>
              </div>

              <div className="bg-[#141111] p-3 rounded border border-red-900/10">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#737373] mb-1">التحقق من التشفير (TLS)</p>
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  مفروض دائماً (HTTPS)
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-red-950/30 text-[10px] text-[#525252] leading-relaxed">
              هذه السياسات الأمنية مدمجة برمجياً في طبقات الحماية ولا يمكن تعديلها أثناء التشغيل لضمان الامتثال الأمني.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
