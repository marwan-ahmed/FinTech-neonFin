import Link from 'next/link';
import { Shield, Eye, Lock, FileWarning, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'سياسة الخصوصية | نيون فين',
  description: 'سياسة الخصوصية لمنصة نيون فين للتقنية المالية. تعرف على قواعد جمع البيانات والحماية متعددة المستأجرين وحقوق المستخدمين.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#050505] text-[#ededed] min-h-screen selection:bg-[#10b981]/30 selection:text-[#10b981] overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#10b981]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/5 to-[#10b981]/5 blur-[150px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24 relative z-10 w-full flex-1">
        
        {/* Breadcrumb */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs text-[#737373] hover:text-[#10b981] transition-colors mb-8 group"
        >
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Header */}
        <div className="mb-10 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#10b981] mb-4">
            <Shield size={12} />
            <span>الحماية والخصوصية</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            سياسة خصوصية البيانات والمعلومات
          </h1>
          <p className="text-xs text-[#737373] mt-2 font-mono">آخر تحديث: 1 تموز 2026</p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-[#b91c1c]/10 border border-[#b91c1c]/25 rounded-2xl p-5 mb-8 flex items-start gap-4 animate-scale-in">
          <div className="p-2.5 rounded-lg bg-[#b91c1c]/20 text-[#ef4444] shrink-0">
            <FileWarning size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">تنبيه قانوني هام</h4>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              تُعتبر هذه الاتفاقية مسودة تقنية أولية توضح ممارسات الحماية البرمجية المتبعة في منصة نيون فين (neonFin)، وليست وثيقة قانونية نهائية معتمدة. يجب مراجعة وتعديل هذه السياسة وتوثيقها من قبل مستشار قانوني عراقي مرخص ومختص بقوانين الاتصالات وحماية البيانات المحلية قبل اعتمادها بشكل رسمي للمتعاملين.
            </p>
          </div>
        </div>

        {/* Policy Contents */}
        <div className="flex flex-col gap-8 text-sm text-[#a3a3a3] leading-relaxed animate-fade-in">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>1. البيانات التي نقوم بجمعها</span>
            </h2>
            <p className="mb-3">
              من أجل تقديم خدمات إدارة القروض والوساطة المالية بكفاءة، نقوم بجمع البيانات التالية عند استخدامك للمنصة:
            </p>
            <ul className="list-disc pr-6 flex flex-col gap-2 mb-4">
              <li><strong>بيانات الحساب والاشتراك:</strong> تشمل الاسم الكامل، البريد الإلكتروني، رقم الهاتف، واسم شركة أو مكتب الوساطة المالية.</li>
              <li><strong>بيانات التحقق والاعرف عميلك (KYC):</strong> تشمل المستندات الثبوتية الحساسة، هويات الأحوال المدنية، بطاقات السكن، والوثائق الرسمية التي يرفعها المستأجر أو عملاؤه لتأكيد الهوية.</li>
              <li><strong>بيانات العمليات المالية:</strong> تشمل سجلات القروض، تفاصيل المحافظ الاستثمارية، حركات البطاقات العينية، والعمليات الحسابية المرتبطة بالمستفيدين.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>2. الغرض من جمع البيانات وكيفية استخدامها</span>
            </h2>
            <p className="mb-3">
              نحن نستخدم البيانات التي يتم جمعها للأغراض التشغيلية التالية فقط:
            </p>
            <ul className="list-disc pr-6 flex flex-col gap-2">
              <li>تسهيل إدارة وحساب القروض والفوائد وتوزيع الأرباح الاستثمارية لمكاتب الوساطة المالية.</li>
              <li>تأكيد هوية المؤسسات وأصحاب المكاتب للحد من الاحتيال وتطبيق قواعد اعرف عميلك (KYC) المعتمدة محلياً.</li>
              <li>إرسال التحديثات الهامة، إشعارات الدفع والاشتراك، وتقديم الدعم الفني للمستخدمين عبر البريد الإلكتروني أو الرسائل المباشرة.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>3. تخزين البيانات وأمانها (هندسة العزل)</span>
            </h2>
            <p className="mb-3">
              نولي في نيون فين أمن وحصانة البيانات أولوية قصوى، ولذلك تم تصميم البنية التحتية للنظام كالتالي:
            </p>
            <ul className="list-disc pr-6 flex flex-col gap-2">
              <li><strong>عزل البيانات (Multi-Tenant Isolation):</strong> تُخزن كافة البيانات وتُدار باستخدام محرك قواعد البيانات المطور **Neon Serverless PostgreSQL**. نعتمد معايير عزل صارمة لضمان حماية بيانات كل مكتب وساطة مالية على حدة وعدم إمكانية تداخل البيانات أو تسريبها بين المشتركين.</li>
              <li><strong>التشفير والحماية:</strong> يتم نقل كافة البيانات عبر قنوات اتصال مشفرة باستخدام بروتوكول TLS، ويتم تشفير البيانات الحساسة وكلمات المرور وفقاً لأحدث معايير الأمان المعتمدة عالمياً.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>4. حقوق المستخدم على بياناته</span>
            </h2>
            <p className="mb-3">
              يحق لكل مستخدم ومكتب مسجل على منصة نيون فين كامل الصلاحيات لإدارة بياناته وتشمل:
            </p>
            <ul className="list-disc pr-6 flex flex-col gap-2">
              <li>حق الوصول إلى كافة البيانات المسجلة ومراجعتها في أي وقت عبر لوحة التحكم الخاصة به.</li>
              <li>حق طلب تعديل أو تصحيح أي بيانات غير دقيقة أو قديمة في النظام.</li>
              <li>حق طلب الحذف الكامل والنهائي للحساب وكافة البيانات المرتبطة به وسجلات الـ KYC من الخوادم، وذلك عبر إرسال طلب رسمي للدعم الفني من خلال البريد الإلكتروني المعتمد للشركة.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              <span>5. التحديثات والتعديلات</span>
            </h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا التقنية أو التنظيمية. سنقوم بإخطاركم بأي تغييرات هامة عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث" في الأعلى.
            </p>
          </section>

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
