
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
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'نيون فين',
            'description': 'منصة SaaS متعددة المستأجرين لإدارة القروض، محافظ الاستثمار، ومخازن البطاقات العينية، موجهة لمكاتب وشركات الوساطة المالية في العراق.',
            'applicationCategory': 'FinanceApplication',
            'operatingSystem': 'Web',
            'offers': {
              '@type': 'AggregateOffer',
              'priceCurrency': 'IQD',
              'lowPrice': '50000',
              'highPrice': '750000',
              'offers': [
                {
                  '@type': 'Offer',
                  'name': 'الخطة الشهرية',
                  'price': '50000',
                  'priceCurrency': 'IQD',
                  'priceSpecification': {
                    '@type': 'UnitPriceSpecification',
                    'price': '50000',
                    'priceCurrency': 'IQD',
                    'referenceQuantity': {
                      '@type': 'QuantitativeValue',
                      'value': '1',
                      'unitCode': 'MON'
                    }
                  }
                },
                {
                  '@type': 'Offer',
                  'name': 'الخطة السنوية',
                  'price': '350000',
                  'priceCurrency': 'IQD',
                  'priceSpecification': {
                    '@type': 'UnitPriceSpecification',
                    'price': '350000',
                    'priceCurrency': 'IQD',
                    'referenceQuantity': {
                      '@type': 'QuantitativeValue',
                      'value': '1',
                      'unitCode': 'ANN'
                    }
                  }
                },
                {
                  '@type': 'Offer',
                  'name': 'خطة مدى الحياة',
                  'price': '750000',
                  'priceCurrency': 'IQD',
                  'priceSpecification': {
                    '@type': 'UnitPriceSpecification',
                    'price': '750000',
                    'priceCurrency': 'IQD',
                    'referenceQuantity': {
                      '@type': 'QuantitativeValue',
                      'value': '1',
                      'unitCode': 'LIF'
                    }
                  }
                }
              ]
            }
          })
        }}
      />
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#10b981]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/5 to-[#10b981]/5 blur-[150px] pointer-events-none"></div>


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
              متابعة طلبات &quot;اعرف عميلك&quot; وتحديد مستويات المخاطر للعملاء وتقييم الملفات القانونية والتراخيص المطلوبة قبل منح التمويلات.
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

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-[#1f1f1f]">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">خطط اشتراك مرنة وعادلة</h2>
          <p className="text-sm text-[#737373] mt-2 max-w-xl mx-auto">
            وصول كامل لجميع أدوات المنصة، الفروقات فقط في مدة الاستخدام لتوائم حجم مكاتبكم المالية.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Plan 1: Monthly */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-8 flex flex-col justify-between hover:border-[#10b981]/30 transition-all duration-300 relative group">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">الخطة الأساسية</span>
              <h3 className="text-xl font-bold text-white mt-2">اشتراك شهري</h3>
              <div className="flex items-baseline gap-1 mt-6 text-[#ededed]">
                <span className="text-4xl font-extrabold font-mono">50,000</span>
                <span className="text-sm font-semibold">د.ع</span>
                <span className="text-xs text-[#737373] mr-2">/ شهرياً</span>
              </div>
              <p className="text-xs text-[#737373] mt-4 leading-relaxed">
                مثالي لتجربة المنصة والبدء بإدارة عمليات الوساطة والقروض بشكل تدريجي.
              </p>
              
              <hr className="border-[#1f1f1f] my-6" />
              
              <ul className="flex flex-col gap-3 text-xs text-[#ededed]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>إدارة القروض والأقساط الذكية</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>توزيع الأرباح النسبية التلقائي</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>جرد وتوزيع مخازن البطاقات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>طلبات التحقق (KYC) وسجلات الأمان</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <Link 
                href="/login?plan=monthly"
                className="w-full text-center bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] font-bold py-3 px-4 rounded-xl text-sm transition-all block"
              >
                اشترك الآن
              </Link>
              <a 
                href="https://wa.me/9647760776774?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%86%D9%8A%D9%88%D9%86%20%D9%81%D9%8a%D9%86%20%D9%88%D8%AE%D8%B7%D8%A9%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D8%A7%D9%84%D8%B4%D9%87%D8%B1%D9%8A%20%D9%82%D8%A8%D9%84%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center text-xs text-[#737373] hover:text-[#10b981] transition-colors py-1 block"
              >
                استفسار سريع عبر واتساب
              </a>
            </div>
          </div>

          {/* Plan 2: Yearly */}
          <div className="bg-[#0c0c0c] border-2 border-[#10b981] rounded-2xl p-8 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 relative group scale-105 z-20">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#10b981] text-black font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              الأكثر توفيراً (وفر 250,000 د.ع)
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#10b981]">الخطة الاحترافية</span>
              <h3 className="text-xl font-bold text-white mt-2">اشتراك سنوي</h3>
              <div className="flex items-baseline gap-1 mt-6 text-[#ededed]">
                <span className="text-4xl font-extrabold font-mono text-[#10b981]">350,000</span>
                <span className="text-sm font-semibold">د.ع</span>
                <span className="text-xs text-[#737373] mr-2">/ سنوياً</span>
              </div>
              <p className="text-xs text-[#737373] mt-4 leading-relaxed">
                مثالي للشركات ومكاتب الوساطة القائمة لضمان استقرار العمل وتخفيض التكاليف التشغيلية.
              </p>
              
              <hr className="border-[#1f1f1f] my-6" />
              
              <ul className="flex flex-col gap-3 text-xs text-[#ededed]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>إدارة القروض والأقساط الذكية</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>توزيع الأرباح النسبية التلقائي</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>جرد وتوزيع مخازن البطاقات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>طلبات التحقق (KYC) وسجلات الأمان</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <Link 
                href="/login?plan=yearly"
                className="w-full text-center bg-[#10b981] hover:bg-[#34d399] text-black font-bold py-3 px-4 rounded-xl text-sm transition-all block shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                اشترك الآن
              </Link>
              <a 
                href="https://wa.me/9647760776774?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%86%D9%8A%D9%88%D9%86%20%D9%81%D9%8A%D9%86%20%D9%88%D8%AE%D8%B7%D8%A9%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D8%A7%D9%84%D8%B3%D9%86%D9%88%D9%8A%20%D9%82%D8%A8%D9%84%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center text-xs text-[#737373] hover:text-[#10b981] transition-colors py-1 block"
              >
                استفسار سريع عبر واتساب
              </a>
            </div>
          </div>

          {/* Plan 3: Lifetime */}
          <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-8 flex flex-col justify-between hover:border-[#10b981]/30 transition-all duration-300 relative group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-blue-400 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              أفضل قيمة استثمارية
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3b82f6]">الخطة اللانهائية</span>
              <h3 className="text-xl font-bold text-white mt-2">شراء مدى الحياة</h3>
              <div className="flex items-baseline gap-1 mt-6 text-[#ededed]">
                <span className="text-4xl font-extrabold font-mono text-blue-400">750,000</span>
                <span className="text-sm font-semibold">د.ع</span>
                <span className="text-xs text-[#737373] mr-2">/ دفعة واحدة</span>
              </div>
              <p className="text-xs text-[#737373] mt-4 leading-relaxed">
                ادفع مرة واحدة فقط، واحصل على وصول أبدي للنظام مع كامل التحديثات المستقبلية مجاناً.
              </p>
              
              <hr className="border-[#1f1f1f] my-6" />
              
              <ul className="flex flex-col gap-3 text-xs text-[#ededed]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>إدارة القروض والأقساط الذكية</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>توزيع الأرباح النسبية التلقائي</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>جرد وتوزيع مخازن البطاقات</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10b981]" />
                  <span>طلبات التحقق (KYC) وسجلات الأمان</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <Link 
                href="/login?plan=lifetime"
                className="w-full text-center bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] font-bold py-3 px-4 rounded-xl text-sm transition-all block"
              >
                اشترك الآن
              </Link>
              <a 
                href="https://wa.me/9647760776774?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A8%D8%A7%D9%84%D9%86%D8%B3%D8%A8%D8%A9%20%D9%84%D8%AE%D8%B7%D8%A9%20%D9%85%D8%AF%D9%89%20%D8%A7%D9%84%D8%AD%D9%8A%D8%A7%D8%A9%20%D9%81%D9%8A%20%D9%86%D9%8A%D9%88%D9%86%20%D9%81%D9%8A%D9%86%20%D9%88%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D9%82%D8%A8%D9%84%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center text-xs text-[#737373] hover:text-[#10b981] transition-colors py-1 block"
              >
                استفسار سريع عبر واتساب
              </a>
            </div>
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

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-[#737373]">
            <Link href="/privacy" className="hover:text-[#10b981] transition-colors">
              سياسة الخصوصية
            </Link>
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
