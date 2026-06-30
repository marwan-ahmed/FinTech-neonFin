import Link from 'next/link';
import { ShieldCheck, FileText, MapPin, Building, Calendar, Mail, Phone, ArrowRight, Zap } from 'lucide-react';

export const metadata = {
  title: 'حول المنصة | نيون فين',
  description: 'تعرف على نيون فين، المنصة العراقية الرائدة والأولى كمنصة SaaS لإدارة القروض، محافظ الاستثمار، ومخازن البطاقات لمكاتب وشركات الوساطة المالية.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#050505] text-[#ededed] min-h-screen selection:bg-[#10b981]/30 selection:text-[#10b981] overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#10b981]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/5 to-[#10b981]/5 blur-[150px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24 relative z-10 w-full flex-1">
        
        {/* Breadcrumb / Return */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs text-[#737373] hover:text-[#10b981] transition-colors mb-8 group"
        >
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Header */}
        <div className="mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#10b981] mb-4">
            <Zap size={12} />
            <span>عن نيون فين</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            المنصة التقنية الأولى لإدارة الوساطة المالية في العراق
          </h1>
          <p className="text-sm md:text-base text-[#a3a3a3] mt-4 leading-relaxed max-w-2xl">
            نحن نضع معايير جديدة للحلول البرمجية للشركات والمكاتب المالية العراقية، عبر تقديم نظام سحابي متطور وآمن يسهل ويحمي العمليات التشغيلية اليومية.
          </p>
        </div>

        {/* Platform Mission */}
        <section className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="text-[#10b981]" size={20} />
            <span>رسالتنا وهويتنا</span>
          </h2>
          <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4">
            تأسست **نيون فين (neonFin)** لتلبية الحاجة المتزايدة في السوق المالي العراقي إلى حلول برمجية متخصصة ومبنية على أساس متين من الحماية وعزل البيانات. نوفر للشركات ومكاتب الوساطة المالية نظاماً متكاملاً (SaaS) لإدارة القروض، تتبع العمليات، إدارة وتوزيع الأرباح الاستثمارية، بالإضافة إلى إدارة مخازن وصناديق البطاقات العينية.
          </p>
          <p className="text-sm text-[#a3a3a3] leading-relaxed">
            نهدف من خلال برمجياتنا إلى القضاء التام على العشوائية التشغيلية وضمان أعلى مستويات الدقة والسرعة والأرشفة الإلكترونية المتوافقة مع متطلبات السوق المحلية وتوجيهات الحماية الحديثة.
          </p>
        </section>

        {/* Company Registration Details */}
        <section className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 mb-8 animate-fade-in" style={{animationDelay: '100ms'}}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Building className="text-[#10b981]" size={20} />
            <span>البيانات الرسمية وتفاصيل الترخيص</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#10b981]/10 text-[#10b981]">
                <FileText size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block">رقم وتاريخ التسجيل الرسمي</span>
                <span className="text-sm font-bold text-white block mt-1">32185 بتاريخ 8/2/2021</span>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#10b981]/10 text-[#10b981]">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block">المقر والعنوان</span>
                <span className="text-sm font-bold text-white block mt-1">العراق – صلاح الدين – سامراء</span>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#10b981]/10 text-[#10b981]">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block">البريد الإلكتروني للشركة</span>
                <a href="mailto:main@neonfiniq.com" className="text-sm font-bold text-white hover:text-[#10b981] transition-colors block mt-1">
                  main@neonfiniq.com
                </a>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#10b981]/10 text-[#10b981]">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#737373] block">رقم الهاتف الرسمي</span>
                <a href="tel:07760776774" className="text-sm font-bold text-white hover:text-[#10b981] transition-colors block mt-1 font-mono">
                  07760776774
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-[#10b981]/5 to-[#3b82f6]/5 border border-[#1f1f1f] p-8 rounded-2xl animate-fade-in" style={{animationDelay: '200ms'}}>
          <h3 className="text-lg font-bold text-white mb-2">هل ترغب بالانضمام لمنصة نيون فين؟</h3>
          <p className="text-xs text-[#a3a3a3] max-w-md mx-auto mb-6 leading-relaxed">
            ابدأ بتسجيل حساب شركتك واختيار الخطة المناسبة لتبدأ إدارة كافة عملياتك المالية بكفاءة وسرعة فائقة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/pricing"
              className="w-full sm:w-auto bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-black font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>استكشف خطط الاشتراك</span>
              <ArrowRight size={16} className="rotate-180" />
            </Link>
            <Link 
              href="/contact"
              className="w-full sm:w-auto bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] font-bold py-2.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center"
            >
              <span>اتصل بنا</span>
            </Link>
          </div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="w-full border-t border-[#1f1f1f] bg-[#050505] py-6 text-xs text-[#737373] relative z-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} نيون فين. جميع الحقوق محفوظة لشركتنا المسجلة برقم 32185.</p>
          <Link href="/privacy" className="hover:text-[#10b981] transition-colors">
            سياسة الخصوصية
          </Link>
        </div>
      </footer>

    </div>
  );
}
