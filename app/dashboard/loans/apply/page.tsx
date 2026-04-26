'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, Calculator, User, List } from 'lucide-react';
import Link from 'next/link';

export default function NewLoanWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    phone: '',
    address: '',
    job: '',
    
    // Loan Info
    cashNeeded: '500000',
    tenure: '6',
    
    // Configurable Pricing (Card model)
    marketCardValue: '5000', // How much cash the card gets in the market
    saleCardValue: '6500',   // How much the loan costs per card
  });

  // Calculate derived values
  const cashNeeded = Number(formData.cashNeeded) || 0;
  const marketValue = Number(formData.marketCardValue) || 1;
  const saleValue = Number(formData.saleCardValue) || 0;
  const tenure = Number(formData.tenure) || 1;

  const cardsCount = cashNeeded / marketValue;
  const totalDebt = cardsCount * saleValue;
  const monthlyInstallment = totalDebt / tenure;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateSchedule = () => {
    const schedule = [];
    const today = new Date();
    for (let i = 1; i <= tenure; i++) {
        // Add i months to today's date
        const dueDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
        schedule.push({
            installmentNumber: i,
            amount: monthlyInstallment,
            dueDate: dueDate.toISOString(),
            status: 'pending'
        });
    }
    return schedule;
  };

  const schedule = generateSchedule();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const loanData = {
        borrowerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        job: formData.job,
        
        assetValue: cashNeeded,
        totalDebt: totalDebt,
        tenure: tenure,
        marketCardValue: Number(formData.marketCardValue),
        saleCardValue: Number(formData.saleCardValue),
        
        status: 'active',
        score: 'A',
        schedule: schedule,
        nextDue: schedule.length > 0 ? schedule[0].dueDate : null,
      };

      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData)
      });
      
      if (!res.ok) throw new Error('Failed to create loan');
      
      router.push('/dashboard/loans');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الإضافة وحفظ الطلب.');
      setIsSubmitting(false);
    }
  };

  // Allow proceeding to step 2 only if step 1 is filled
  const canProceedToStep2 = formData.name && formData.phone && formData.address && formData.job;

  return (
    <div className="flex flex-col gap-6 h-full pb-10 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">معالج فتح حساب وتسجيل قرض</h2>
          <p className="text-sm text-[#737373] mt-1">إنشاء سجل جديد للزبون مع احتساب تلقائي للمرابحة وجدولة الدفعات.</p>
        </div>
        <Link href="/dashboard" className="text-sm text-[#737373] hover:text-white transition-colors">
          إلغاء والعودة
        </Link>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center w-full mt-4">
        <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'border-[#262626] bg-[#141414] text-[#737373]'}`}>
            <User size={18} />
          </div>
          <span className="text-[11px] font-bold mt-2 text-white">البيانات الشخصية</span>
        </div>
        <div className="h-[2px] w-12 bg-[#262626] -mt-6"></div>
        <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'border-[#262626] bg-[#141414] text-[#737373]'}`}>
            <Calculator size={18} />
          </div>
          <span className="text-[11px] font-bold mt-2 text-white">حاسبة القرض</span>
        </div>
        <div className="h-[2px] w-12 bg-[#262626] -mt-6"></div>
        <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'border-[#262626] bg-[#141414] text-[#737373]'}`}>
            <List size={18} />
          </div>
          <span className="text-[11px] font-bold mt-2 text-white">جدول الدفعات والمراجعة</span>
        </div>
      </div>

      <div className="bg-[#141414] border border-[#262626] rounded-lg p-6 mt-4 relative overflow-hidden min-h-[400px] flex flex-col">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6 flex-1 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white border-b border-[#262626] pb-3 mb-6">القسم الأول: معلومات الزبون</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block tracking-wider">الاسم الرباعي واللقب</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors" placeholder="مثال: أحمد محمد علي عبدالله" />
              </div>
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block tracking-wider">رقم الهاتف</label>
                <input required name="phone" dir="ltr" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white text-left focus:border-[#10b981] outline-none transition-colors" placeholder="07xxxxxxxxx" />
              </div>
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block tracking-wider">عنوان السكن بالتفصيل</label>
                <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors" placeholder="المحافظة - القضاء - المنطقة - المحلة والزقاق" />
              </div>
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block tracking-wider">المهنة / الوظيفة</label>
                <input required name="job" value={formData.job} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors" placeholder="موظف حكومي / كاسب / مبضع" />
              </div>
            </div>
            <div className="mt-auto pt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)} 
                disabled={!canProceedToStep2}
                className="flex items-center gap-2 bg-[#10b981] text-black font-bold py-3 px-6 rounded hover:bg-[#34d399] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                التالي: حاسبة القرض
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Loan Calculator */}
        {step === 2 && (
          <div className="space-y-6 flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
            <h3 className="text-lg font-bold text-white border-b border-[#262626] pb-3 mb-4">القسم الثاني: حاسبة القرض المباشرة</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
              {/* Inputs */}
              <div className="space-y-5 bg-[#0f0f0f] p-5 rounded border border-[#262626]">
                <div>
                  <label className="text-xs text-[#737373] uppercase mb-1 block tracking-wider">مبلغ القرض المطلوب (كاش للزبون)</label>
                  <div className="relative">
                    <input type="number" dir="ltr" name="cashNeeded" value={formData.cashNeeded} onChange={handleInputChange} className="w-full bg-[#141414] border border-[#262626] rounded px-4 py-3 text-white text-left focus:border-[#10b981] outline-none transition-colors font-mono text-lg" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] text-sm">IQD</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#737373] uppercase mb-1 block tracking-wider">مدة القرض (بالأشهر)</label>
                  <select name="tenure" value={formData.tenure} onChange={(e) => setFormData(prev => ({...prev, tenure: e.target.value}))} className="w-full bg-[#141414] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors dir-rtl">
                    <option value="1">شهر واحد</option>
                    <option value="2">شهرين</option>
                    <option value="3">3 أشهر</option>
                    <option value="4">4 أشهر</option>
                    <option value="5">5 أشهر</option>
                    <option value="6">6 أشهر</option>
                    <option value="12">12 شهر (سنة)</option>
                    <option value="24">24 شهر (سنتين)</option>
                  </select>
                </div>

                {/* Engine Settings */}
                <div className="pt-4 mt-2 border-t border-[#262626]">
                  <p className="text-[10px] text-[#737373] uppercase mb-3 flex items-center justify-between">
                    <span>إعدادات السلعة (بطاقات التعبئة)</span>
                    <span className="text-[#f59e0b]">تحكم الأرباح</span>
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-[#525252] block mb-1">سعر السوق (دينار)</label>
                      <input type="number" dir="ltr" name="marketCardValue" value={formData.marketCardValue} onChange={handleInputChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-[#ededed] text-left focus:border-[#10b981] outline-none text-xs font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#525252] block mb-1">سعر البيع الآجل (دينار)</label>
                      <input type="number" dir="ltr" name="saleCardValue" value={formData.saleCardValue} onChange={handleInputChange} className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-[#ededed] text-left focus:border-[#10b981] outline-none text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Live Results */}
              <div className="bg-[#10b981]/5 rounded border border-[#10b981]/20 p-6 flex flex-col justify-center">
                <h4 className="text-sm font-bold text-[#10b981] mb-6 flex items-center gap-2">
                  <Calculator size={18} />
                  نتيجة الاحتساب المباشر
                </h4>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-[#10b981]/10 pb-4">
                    <div>
                      <p className="text-[11px] text-[#737373] mb-1">عدد البطاقات اللازمة</p>
                      <p className="font-mono text-xl text-white">{cardsCount.toLocaleString('en-US')}</p>
                    </div>
                    <span className="text-xs text-[#10b981]">بطاقة</span>
                  </div>

                  <div className="flex justify-between items-end border-b border-[#10b981]/10 pb-4">
                    <div>
                      <p className="text-[11px] text-[#737373] mb-1">المبلغ الإجمالي المستحق (المديونية)</p>
                      <p className="font-mono text-2xl font-bold text-white tracking-tight">{Math.round(totalDebt).toLocaleString('en-US')}</p>
                    </div>
                    <span className="text-xs text-[#10b981]">دينار</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[11px] text-[#737373] mb-1">الدفعة الشهرية المتوقعة</p>
                      <p className="font-mono text-3xl font-bold text-[#10b981] tracking-tighter">{Math.round(monthlyInstallment).toLocaleString('en-US')}</p>
                    </div>
                    <span className="text-xs text-[#10b981]">دينار / شهر</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-[#10b981]/10 flex justify-between">
                    <p className="text-[10px] text-[#737373]">الربح الصافي المتوقع</p>
                    <p className="font-mono text-xs text-[#10b981]">+{Math.round(totalDebt - cashNeeded).toLocaleString('en-US')} د.ع</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex justify-between">
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center gap-2 text-white font-bold py-3 px-6 rounded border border-[#262626] hover:bg-[#262626] transition-colors">
                <ArrowRight size={18} />
                الرجوع
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={cashNeeded <= 0}
                className="flex items-center gap-2 bg-[#10b981] text-black font-bold py-3 px-6 rounded hover:bg-[#34d399] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                التالي: إنشاء جدول الدفعات
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Schedule */}
        {step === 3 && (
          <div className="space-y-6 flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
            <h3 className="text-lg font-bold text-white border-b border-[#262626] pb-3 mb-2">القسم الثالث: جدول الدفعات والمراجعة النهائية</h3>
            
            <div className="bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#737373] uppercase mb-1">الزبون</p>
                <p className="text-sm text-white font-bold">{formData.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#737373] uppercase mb-1 text-left">مبلغ القرض الكاش</p>
                <p className="text-sm text-[#10b981] font-mono font-bold" dir="ltr">{cashNeeded.toLocaleString()} IQD</p>
              </div>
              <div>
                 <p className="text-[10px] text-[#737373] uppercase mb-1 text-left">إجمالي التسديد</p>
                 <p className="text-sm text-[#ef4444] font-mono font-bold" dir="ltr">{Math.round(totalDebt).toLocaleString()} IQD</p>
              </div>
            </div>

            <div className="flex-1 overflow-auto border border-[#262626] rounded bg-[#141414]">
              <table className="w-full text-right text-sm">
                <thead className="bg-[#1a1a1a] border-b border-[#262626] text-[#737373] text-[10px] uppercase">
                  <tr>
                    <th className="p-3 font-normal">رقم الدفعة</th>
                    <th className="p-3 font-normal">تاريخ الاستحقاق</th>
                    <th className="p-3 font-normal">المبلغ (دينار)</th>
                    <th className="p-3 font-normal">حالة الدفعة</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {schedule.map((installment, idx) => (
                    <tr key={idx} className="border-b border-[#262626] last:border-0 hover:bg-[#1a1a1a]">
                      <td className="p-3 text-white">#{installment.installmentNumber}</td>
                      <td className="p-3 text-[#ededed]">{new Date(installment.dueDate).toLocaleDateString('ar-IQ')}</td>
                      <td className="p-3 text-[#10b981] font-bold" dir="ltr">{Math.round(installment.amount).toLocaleString()}</td>
                      <td className="p-3">
                        <span className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded border border-[#f59e0b]/20">قيد الانتظار</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-4 border-t border-[#262626] flex justify-between">
              <button 
                onClick={() => setStep(2)} 
                className="flex items-center gap-2 text-white font-bold py-3 px-6 rounded border border-[#262626] hover:bg-[#262626] transition-colors"
                disabled={isSubmitting}>
                <ArrowRight size={18} />
                تعديل الحسبة
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#10b981] text-black font-bold py-3 px-8 rounded hover:bg-[#34d399] transition-colors disabled:opacity-50">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    جاري حفظ الطلب...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    اعتماد الطلب وبدء القرض
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
