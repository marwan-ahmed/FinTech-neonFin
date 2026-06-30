import Link from 'next/link';
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="bg-[#050505] text-[#ededed] min-h-screen selection:bg-[#10b981]/30 selection:text-[#10b981] overflow-x-hidden relative flex flex-col justify-between">
      
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
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#10b981]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/5 to-[#10b981]/5 blur-[150px] pointer-events-none"></div>


      {/* Pricing Content */}
      <main className="flex-1 flex flex-col justify-center py-16">
        <section className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">خطط أسعار مرنة وعادلة</h1>
            <p className="text-base text-[#a3a3a3] mt-4 max-w-xl mx-auto leading-relaxed">
              وصول كامل لجميع أدوات وإمكانات المنصة دون قيود أو شروط، فقط اختر مدة الاستخدام المناسبة لمكتبك.
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
                  تفعيل شهري مرن، ممتاز للمكاتب التي ترغب في تجربة المنصة بمرونة تامة وبأقل تكلفة تشغيلية أولية.
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
                  className="w-full text-center bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] font-bold py-3.5 px-4 rounded-xl text-sm transition-all block"
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
                  الخيار المفضل للمؤسسات المالية المستقرة؛ حيث يقلل الكلفة بنسبة 40% مقارنة بالخطة الشهرية.
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
                  className="w-full text-center bg-[#10b981] hover:bg-[#34d399] text-black font-bold py-3.5 px-4 rounded-xl text-sm transition-all block shadow-[0_0_20px_rgba(16,185,129,0.2)]"
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
                  تملك النظام مدى الحياة. تملك الأصول والبرمجيات للأبد دون أي تجديدات دورية أو رسوم مخفية.
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
                  className="w-full text-center bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] font-bold py-3.5 px-4 rounded-xl text-sm transition-all block"
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
      </main>

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
