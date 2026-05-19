'use client';

import Link from 'next/link';
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  Users, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Activity, 
  UserCircle, 
  ArrowLeft, 
  ArrowRight,
  Lock, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  CreditCard 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#050505] text-[#ededed] min-h-screen selection:bg-[#10b981]/30 selection:text-[#10b981] overflow-x-hidden relative">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#10b981]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/5 to-[#10b981]/5 blur-[150px] pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#050505]/70 border-b border-[#1f1f1f] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Zap size={20} className="text-black" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-[#10b981] transition-colors">نيون فين</span>
              <span className="text-[10px] text-[#737373] block font-mono">neonFin v1.0</span>
            </div>
          </div>

          {/* Quick Action Button */}
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-black font-bold py-2.5 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95 text-sm"
          >
            <span>لوحة التحكم</span>
            <ArrowLeft size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#10b981] mb-8 animate-fade-in">
          <Sparkles size={14} />
          <span>مستقبل التقنية المالية والوساطة الرقمية في العراق</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          إدارة مالية ذكية مبنية على <span className="bg-gradient-to-r from-[#10b981] to-[#3b82f6] bg-clip-text text-transparent">الشفافية والأمان المطلق</span>
        </h1>

        {/* Description */}
        <p className="text-base md:text-lg text-[#a3a3a3] max-w-2xl mx-auto mt-6 leading-relaxed">
          منصة **نيون فين** الاحترافية لإدارة القروض، محافظ الاستثمار، وتوزيع الأرباح التلقائي مع واجهات سينمائية متطورة وهندسة برمجية مبنية للمستقبل.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto bg-gradient-to-r from-[#10b981] to-[#059669] text-black font-bold py-3.5 px-8 rounded-xl text-base transition-transform active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2"
          >
            <span>ابدأ الآن </span>
            <ArrowLeft size={18} />
          </Link>
          <a 
            href="#sections"
            className="w-full sm:w-auto bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] font-bold py-3.5 px-8 rounded-xl text-base transition-all flex justify-center items-center gap-2"
          >
            <span>استكشف أقسام النظام</span>
          </a>
        </div>
      </header>

      {/* Stats Counter Row */}
      <section className="max-w-7xl mx-auto px-6 py-10 relative z-10 border-t border-b border-[#1f1f1f] bg-[#0c0c0c]/40 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-3xl font-extrabold text-white font-mono">100%</h4>
            <p className="text-xs text-[#737373] mt-1.5">أمان وعزل كامل لبيانات المؤسسات</p>
          </div>
          <div className="border-t md:border-t-0 md:border-r md:border-l border-[#1f1f1f] py-4 md:py-0">
            <h4 className="text-3xl font-extrabold text-[#10b981] font-mono">تلقائي</h4>
            <p className="text-xs text-[#737373] mt-1.5">محرك توزيع الأرباح وحساب الفوائد</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-blue-400 font-mono">د.ع</h4>
            <p className="text-xs text-[#737373] mt-1.5">دعم كامل لعملة الدينار العراقي</p>
          </div>
        </div>
      </section>

      {/* Main Sections Description Grid */}
      <section id="sections" className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">أقسام المنصة المتكاملة</h2>
          <p className="text-sm text-[#737373] mt-2">منصة واحدة مصممة خصيصاً لإدارة وتتبع كافة عملياتك المالية بكفاءة متناهية</p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Section 1: لوحة التحكم */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Layers size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">لوحة التحكم</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              شاشة متكاملة تلخص مؤشرات الأداء الحيوية، حجم السيولة، وأرباح المستثمرين الكلية، مع تحية ذكية متغيرة بحسب الوقت وملخص للأقساط المستحقة أسبوعياً.
            </p>
          </div>

          {/* Section 2: محافظ الاستثمار */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Wallet size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">محافظ الاستثمار</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              إدارة رؤوس أموال المستثمرين وتوزيع الحصص النسبية، ومحاكاة فورية للعائد المتوقع وتتبع الأرباح الموزعة عليهم تلقائياً بكل دقة.
            </p>
          </div>

          {/* Section 3: مخازن البطاقات */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">مخازن البطاقات</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              نظام جرد وتوزيع البطاقات العينية (الكرتات) مع حساب تكلفة الجملة وسعر السوق وسعر البيع لضمان حماية السيولة المالية وتوثيق السلع القانونية.
            </p>
          </div>

          {/* Section 4: إدارة القروض */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Coins size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">إدارة القروض</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              بناء وإدارة القروض وتحديد نوع الصرف (نقدي/بطاقات)، مع محرك حساب الأقساط الذكي وإدراج جدول السداد ومتابعة التعثر وحالات الدفع المتعددة.
            </p>
          </div>

          {/* Section 5: طلبات التحقق */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">طلبات التحقق (KYC)</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              متابعة طلبات "اعرف عميلك" وتحديد مستويات المخاطر للعملاء وتقييم الملفات القانونية والتراخيص المطلوبة قبل منح التمويلات.
            </p>
          </div>

          {/* Section 6: التقارير */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">التقارير</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              محرك استخراج التقارير وتصدير كشوفات الحساب وملخصات الأداء السنوية والشهرية بصيغ Excel (CSV) أو كشوفات مهيئة للطباعة كملفات PDF.
            </p>
          </div>

          {/* Section 7: سجل المراقبة */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">سجل المراقبة</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              سجل تدقيق كامل لكافة العمليات الإدارية والمحاسبية داخل النظام (تاريخ العملية، المنفذ، التفاصيل) لضمان موثوقية العمل ومكافحة التلاعب والشفافية.
            </p>
          </div>

          {/* Section 8: حسابي */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#10b981]/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <UserCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors">حسابي</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              إدارة الهوية والتعديل على إعدادات المنظمة، وتخصيص العلامة التجارية للوسيط والبيانات الشخصية وكلمات المرور بأمان عالٍ.
            </p>
          </div>

        </div>
      </section>

      {/* Features & Call to Action (Security focus) */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="bg-gradient-to-br from-[#0c0c0c] to-[#121212] border border-[#1f1f1f] rounded-3xl p-8 md:p-16 flex flex-col lg:flex-row gap-12 items-center justify-between shadow-2xl relative overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#10b981]/5 blur-[80px] pointer-events-none"></div>

          <div className="max-w-xl text-right">
            <h3 className="text-2xl md:text-3xl font-bold text-white">أمان فائق وعزل كامل للبيانات</h3>
            <p className="text-xs md:text-sm text-[#737373] mt-4 leading-relaxed">
              تعتمد منصة **نيون فين** على أعلى المعايير الهندسية لعزل بيانات المؤسسات المالية. باستخدام بنية **Multi-Tenant Isolation** وقاعدة بيانات **Neon Serverless PostgreSQL** المشفرة، نضمن أن تظل أموالك، مستنداتك، وبيانات عملائك محمية بشكل مطلق في بيئة معزولة بالكامل.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#10b981]" />
                <span className="text-xs text-white">تشفير كامل لكافة بيانات الاتصال</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#10b981]" />
                <span className="text-xs text-white">تدقيق أمني مستمر للعمليات الإدارية والمحاسبية</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full lg:w-auto">
            <Link 
              href="/dashboard"
              className="w-full lg:w-auto block text-center bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-black font-bold py-4 px-10 rounded-2xl text-base transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95"
            >
              دخول النظام الآمن
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] bg-[#050505] text-[#737373] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo & Version */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <span className="text-sm font-bold text-white">نيون فين</span>
              <span className="text-[10px] text-[#525252] block font-mono">© 2026. كل الحقوق محفوظة.</span>
            </div>
          </div>

          {/* Team Reference */}
          <div className="text-center md:text-left text-xs font-medium text-[#737373]">
            <span>تطوير وإشراف </span>
            <span className="text-white hover:text-[#10b981] transition-colors font-bold">فريق عمل نيون فين للتقنية المالية</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
