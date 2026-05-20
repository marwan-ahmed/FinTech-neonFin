import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, Calculator, User, List, Printer, Download, X, AlertTriangle } from 'lucide-react';

export default function NewLoanModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBorrowers, setExistingBorrowers] = useState<string[]>([]);
  const [existingBorrowerList, setExistingBorrowerList] = useState<{name: string, phone: string, address: string, job: string}[]>([]);
  const [nameWarning, setNameWarning] = useState<string | null>(null);

  const [errorObj, setErrorObj] = useState<string | null>(null);

  // Fetch existing borrowers when modal opens
  useEffect(() => {
    async function fetchLoans() {
      try {
        const res = await fetch('/api/loans');
        if (res.ok) {
          const data = await res.json();
          const list: {name: string, phone: string, address: string, job: string}[] = [];
          const seen = new Set<string>();
          data.forEach((l: any) => {
            const trimmed = l.borrowerName?.trim();
            if (trimmed && !seen.has(trimmed.toLowerCase())) {
              seen.add(trimmed.toLowerCase());
              list.push({
                name: trimmed,
                phone: l.phone || '',
                address: l.address || '',
                job: l.job || ''
              });
            }
          });
          setExistingBorrowerList(list);
          const names = list.map(l => l.name.toLowerCase());
          setExistingBorrowers(names);
        }
      } catch (err) {
        console.error("Failed to fetch existing loans", err);
      }
    }
    fetchLoans();
  }, []);

  const [cardBatches, setCardBatches] = useState<any[]>([]);

  // Fetch card batches when modal opens
  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch('/api/card-batches');
        if (res.ok) {
          const data = await res.json();
          setCardBatches(data.filter((b: any) => b.remainingQuantity > 0));
        }
      } catch (err) {
        console.error("Failed to fetch card batches", err);
      }
    }
    fetchBatches();
  }, []);

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

    // Card Disbursement
    disbursementType: 'cash',
    cardBatchId: '',
    cardsAllocated: '100',
    cardWholesalePrice: '0',
  });

  // Calculate derived values
  const isCardDisbursement = formData.disbursementType === 'cards';
  const marketValue = Number(formData.marketCardValue) || 1;
  const saleValue = Number(formData.saleCardValue) || 0;
  const tenure = Number(formData.tenure) || 1;

  const cardsCount = isCardDisbursement 
    ? Number(formData.cardsAllocated) || 0 
    : (Number(formData.cashNeeded) || 0) / marketValue;

  const cashNeeded = isCardDisbursement
    ? cardsCount * marketValue
    : Number(formData.cashNeeded) || 0;

  const totalDebt = cardsCount * saleValue;
  const monthlyInstallment = totalDebt / tenure;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name') {
      const typedName = value.trim().toLowerCase();
      if (typedName && existingBorrowers.includes(typedName)) {
        setNameWarning("يوجد اسم مشابه تمامًا مسجل في النظام مسبقاً.");
      } else {
        setNameWarning(null);
      }
    }
  };

  const schedule = useMemo(() => {
    const s = [];
    const today = new Date();
    for (let i = 1; i <= tenure; i++) {
        const dueDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
        s.push({
            installmentNumber: i,
            amount: monthlyInstallment,
            dueDate: dueDate.toISOString(),
            status: 'pending'
        });
    }
    return s;
  }, [tenure, monthlyInstallment]);

  const handleSubmit = async () => {
    // If card disbursement, validate batch selected and quantities
    if (isCardDisbursement) {
      if (!formData.cardBatchId) {
        setErrorObj("يرجى اختيار وجبة البطاقات قبل المتابعة.");
        setIsSubmitting(false);
        return;
      }
      const selected = cardBatches.find(b => b.id === formData.cardBatchId);
      if (selected && Number(formData.cardsAllocated) > selected.remainingQuantity) {
        setErrorObj(`الكمية المطلوبة تتجاوز المتاح في مخزن هذه الوجبة (${selected.remainingQuantity} كارت).`);
        setIsSubmitting(false);
        return;
      }
    }

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

        disbursementType: formData.disbursementType,
        cardBatchId: isCardDisbursement ? formData.cardBatchId : null,
        cardsAllocated: isCardDisbursement ? Number(formData.cardsAllocated) : 0,
        cardWholesalePrice: isCardDisbursement ? Number(formData.cardWholesalePrice) : null,
        
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
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to create loan');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error during handleSubmit:', error);
      setErrorObj(error.message || 'حدث خطأ أثناء الإضافة وحفظ الطلب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow proceeding to step 2 only if step 1 is filled
  const canProceedToStep2 = formData.name.trim().length >= 2;

  const exportScheduleCSV = () => {
    const headers = ["رقم الدفعة", "تاريخ الاستحقاق", "المبلغ (دينار)", "حالة الدفعة"];
    const csvContent = [
      headers.join(","),
      ...schedule.map(row => [
        `"#${row.installmentNumber}"`,
        `"${new Date(row.dueDate).toLocaleDateString('ar-IQ')}"`,
        Math.round(row.amount),
        `"قيد الانتظار"`
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `جدول_دفعات_${formData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="w-full max-w-4xl bg-[#141414] border border-[#262626] rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] p-5 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">معالج فتح حساب وتسجيل قرض</h2>
            <p className="text-xs text-[#737373] mt-1">إنشاء سجل جديد للزبون مع احتساب تلقائي للمرابحة وجدولة الدفعات.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#737373] hover:text-white hover:bg-[#262626] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {errorObj && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded p-4 m-5 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            {errorObj}
          </div>
        )}

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          
          {/* Progress Stepper */}
          <div className="flex items-center w-full max-w-xl mx-auto mb-8">
            <div className={`flex flex-col items-center flex-1 transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step >= 1 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'border-[#262626] bg-[#141414] text-[#737373]'}`}>
                <User size={14} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold mt-2 text-white text-center">البيانات الشخصية</span>
            </div>
            <div className={`h-[2px] w-8 sm:w-16 -mt-6 transition-colors duration-300 ${step >= 2 ? 'bg-[#10b981]' : 'bg-[#262626]'}`}></div>
            <div className={`flex flex-col items-center flex-1 transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step >= 2 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'border-[#262626] bg-[#141414] text-[#737373]'}`}>
                <Calculator size={14} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold mt-2 text-white text-center">حاسبة القرض</span>
            </div>
            <div className={`h-[2px] w-8 sm:w-16 -mt-6 transition-colors duration-300 ${step >= 3 ? 'bg-[#10b981]' : 'bg-[#262626]'}`}></div>
            <div className={`flex flex-col items-center flex-1 transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step >= 3 ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]' : 'border-[#262626] bg-[#141414] text-[#737373]'}`}>
                <List size={14} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold mt-2 text-white text-center">المراجعة</span>
            </div>
          </div>

          <div className="relative">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">الاسم الرباعي واللقب</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors" placeholder="مثال: أحمد محمد علي عبدالله" />
                    {existingBorrowerList.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5 bg-[#0f0f0f] p-2.5 rounded-lg border border-[#262626]">
                        <span className="text-[10px] text-[#737373] font-bold">اختيار سريع وتعبئة تلقائية من الزبائن المسجلين مسبقاً:</span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {existingBorrowerList
                            .filter(b => !formData.name || b.name.toLowerCase().includes(formData.name.toLowerCase()))
                            .map((b, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    name: b.name,
                                    phone: b.phone || prev.phone,
                                    address: b.address || prev.address,
                                    job: b.job || prev.job
                                  }));
                                  setNameWarning("تم سحب بيانات الزبون المسجلة مسبقاً بنجاح.");
                                }}
                                className={`text-[10px] px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                                  formData.name === b.name
                                    ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981] font-bold'
                                    : 'bg-[#141414] border-[#262626] hover:border-[#10b981]/40 text-[#ededed]'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                                <span>{b.name}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    {nameWarning && (
                      <p className={`mt-2 text-xs flex items-center gap-1 font-bold ${nameWarning.includes('بنجاح') ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                        <AlertTriangle size={14} />
                        {nameWarning}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">رقم الهاتف</label>
                    <input required name="phone" dir="ltr" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white text-left focus:border-[#10b981] outline-none transition-colors" placeholder="07xxxxxxxxx" />
                  </div>
                  <div>
                    <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">عنوان السكن بالتفصيل</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors" placeholder="المحافظة - القضاء - المنطقة - المحلة والزقاق" />
                  </div>
                  <div>
                    <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">المهنة / الوظيفة</label>
                    <input name="job" value={formData.job} onChange={handleInputChange} className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors" placeholder="موظف حكومي / كاسب / متبضع" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button 
                    type="button"
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
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-5 bg-[#0f0f0f] p-5 rounded border border-[#262626]">
                    <div>
                      <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">طريقة صرف القرض</label>
                      <select name="disbursementType" value={formData.disbursementType} onChange={handleInputChange} className="w-full bg-[#141414] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors dir-rtl appearance-none mb-4">
                        <option value="cash">صرف نقدي فوري (من السيولة)</option>
                        <option value="cards">صرف بطاقات عينية (تمويل عيني)</option>
                      </select>
                    </div>

                    {!isCardDisbursement ? (
                      <div>
                        <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">مبلغ القرض المطلوب (كاش للزبون)</label>
                        <div className="relative">
                          <input type="number" dir="ltr" name="cashNeeded" value={formData.cashNeeded} onChange={handleInputChange} className="w-full bg-[#141414] border border-[#262626] rounded px-4 py-3 text-white text-left focus:border-[#10b981] outline-none transition-colors font-mono text-lg" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] text-sm font-bold">IQD</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 border-r-2 border-[#10b981]/30 pr-4 py-1">
                        <div>
                          <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">اختر وجبة البطاقات المتاحة</label>
                          <select 
                            name="cardBatchId" 
                            value={formData.cardBatchId} 
                            onChange={(e) => {
                              const batchId = e.target.value;
                              const selected = cardBatches.find(b => b.id === batchId);
                              setFormData(prev => ({
                                ...prev,
                                cardBatchId: batchId,
                                cardWholesalePrice: selected ? selected.wholesalePrice.toString() : '0'
                              }));
                            }} 
                            className="w-full bg-[#141414] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors dir-rtl appearance-none"
                          >
                            <option value="">-- اختر وجبة بطاقات --</option>
                            {cardBatches.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.batchName} (المتبقي: {b.remainingQuantity} كارت • بسعر جملة {parseFloat(b.wholesalePrice).toLocaleString()} د.ع)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">عدد البطاقات المراد صرفها للمقترض</label>
                          <input 
                            type="number" 
                            dir="ltr" 
                            name="cardsAllocated" 
                            value={formData.cardsAllocated} 
                            onChange={handleInputChange} 
                            className="w-full bg-[#141414] border border-[#262626] rounded px-4 py-3 text-white text-left focus:border-[#10b981] outline-none transition-colors font-mono text-lg" 
                            placeholder="100"
                          />
                          {formData.cardBatchId && (() => {
                            const selected = cardBatches.find(b => b.id === formData.cardBatchId);
                            if (selected && Number(formData.cardsAllocated) > selected.remainingQuantity) {
                              return (
                                <p className="text-xs text-red-500 font-bold mt-1">
                                  عذراً، الكمية المطلوبة تتجاوز الكمية المتاحة في الوجبة المحددة ({selected.remainingQuantity} كارت).
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-[#737373] uppercase mb-1.5 block tracking-wider">مدة القرض (بالأشهر)</label>
                      <select name="tenure" value={formData.tenure} onChange={(e) => setFormData(prev => ({...prev, tenure: e.target.value}))} className="w-full bg-[#141414] border border-[#262626] rounded px-4 py-3 text-white focus:border-[#10b981] outline-none transition-colors dir-rtl appearance-none">
                        <option value="1">شهر واحد</option>
                        <option value="2">شهرين</option>
                        <option value="3">3 أشهر</option>
                        <option value="4">4 أشهر</option>
                        <option value="5">5 أشهر</option>
                        <option value="6">6 أشهر</option>
                        <option value="12">12 شهر (سنة)</option>
                        <option value="18">18 شهر</option>
                        <option value="24">24 شهر (سنتين)</option>
                      </select>
                    </div>

                    {/* Engine Settings */}
                    <div className="pt-4 mt-2 border-t border-[#262626]">
                      <p className="text-[10px] text-[#737373] uppercase mb-3 flex items-center justify-between">
                        <span>إعدادات السلعة (بطاقات التعبئة)</span>
                        <span className="text-[#f59e0b]">تعديل أرباح المستثمر</span>
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
                  <div className="bg-[#10b981]/5 rounded border border-[#10b981]/20 p-5 sm:p-6 flex flex-col justify-between text-center sm:text-right">
                    <div>
                      <h4 className="text-sm font-bold text-[#10b981] mb-5 flex justify-center sm:justify-start items-center gap-2">
                        <Calculator size={18} />
                        توضيح الاحتساب المباشر
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-[#10b981]/10 pb-2">
                          <p className="text-[11px] text-[#737373]">عدد البطاقات الممنوحة</p>
                          <p className="font-mono text-sm text-white">{cardsCount.toLocaleString('en-US')} <span className="text-[10px] text-[#10b981] font-sans">بطاقة</span></p>
                        </div>
                        
                        <div className="flex justify-between items-center border-b border-[#10b981]/10 pb-2">
                          <p className="text-[11px] text-[#737373]">المبلغ الذي سيحصل عليه المقترض</p>
                          <p className="font-mono text-sm font-bold text-white">{Math.round(cashNeeded).toLocaleString('en-US')} <span className="text-[10px] text-[#10b981] font-sans">دينار</span></p>
                        </div>

                        <div className="flex justify-between items-center border-b border-[#10b981]/10 pb-2">
                          <p className="text-[11px] text-[#737373]">المبلغ الذي سيسدده المقترض</p>
                          <p className="font-mono text-sm font-bold text-[#ef4444]">{Math.round(totalDebt).toLocaleString('en-US')} <span className="text-[10px] text-[#10b981] font-sans">دينار</span></p>
                        </div>

                        <div className="flex justify-between items-center border-b border-[#10b981]/10 pb-2">
                          <p className="text-[11px] text-[#737373]">عدد الأقساط</p>
                          <p className="font-mono text-sm font-bold text-white">{tenure} <span className="text-[10px] text-[#10b981] font-sans">قسط</span></p>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <p className="text-[11px] text-[#737373]">قيمة القسط بالشهر الواحد</p>
                          <p className="font-mono text-xl font-bold text-[#10b981] tracking-tighter">{Math.round(monthlyInstallment).toLocaleString('en-US')} <span className="text-[10px] text-[#10b981] font-sans">دينار</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Live Amortization / Mini Schedule Preview */}
                    {schedule.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#10b981]/10 text-right">
                        <p className="text-[10px] text-[#737373] font-bold mb-2">جدول الاستحقاق المبدئي الفوري:</p>
                        <div className="max-h-28 overflow-y-auto pr-1 border border-[#10b981]/10 rounded bg-[#0f0f0f]/60">
                          <table className="w-full text-right text-[11px]">
                            <thead className="bg-[#141414] text-[#737373] sticky top-0 border-b border-[#10b981]/10">
                              <tr>
                                <th className="p-1.5 font-normal font-sans">#</th>
                                <th className="p-1.5 font-normal font-sans">التاريخ</th>
                                <th className="p-1.5 font-normal font-sans">المبلغ</th>
                              </tr>
                            </thead>
                            <tbody className="font-mono text-[#ededed]">
                              {schedule.map((sch, i) => (
                                <tr key={i} className="border-b border-[#262626]/40 last:border-0 hover:bg-[#1a1a1a]">
                                  <td className="p-1.5 text-[#737373]">#{sch.installmentNumber}</td>
                                  <td className="p-1.5">{new Date(sch.dueDate).toLocaleDateString('ar-IQ')}</td>
                                  <td className="p-1.5 text-[#10b981] font-bold">{Math.round(sch.amount).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between gap-3">
                  <button 
                    type="button"
                    onClick={() => setStep(1)} 
                    className="flex justify-center items-center gap-2 text-white font-bold py-3 px-6 rounded border border-[#262626] hover:bg-[#262626] transition-colors">
                    <ArrowRight size={18} />
                    رجوع
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep(3)} 
                    disabled={cashNeeded <= 0}
                    className="flex justify-center items-center gap-2 bg-[#10b981] text-black font-bold py-3 px-6 rounded hover:bg-[#34d399] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    التالي: مراجعة الدفعات
                    <ArrowLeft size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Schedule */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {errorObj && (
                  <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-500 text-sm font-bold w-full text-center">
                    {errorObj}
                  </div>
                )}
                
                <div className="bg-[#0f0f0f] border border-[#262626] rounded px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase mb-1">المقترض</p>
                    <p className="text-sm text-white font-bold">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase mb-1">رأس المال</p>
                    <p className="text-sm text-[#10b981] font-mono font-bold" dir="ltr">{cashNeeded.toLocaleString()} IQD</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-[#737373] uppercase mb-1">إجمالي التسديد</p>
                     <p className="text-sm text-[#ef4444] font-mono font-bold" dir="ltr">{Math.round(totalDebt).toLocaleString()} IQD</p>
                  </div>
                </div>

                <div className="border border-[#262626] rounded bg-[#141414] overflow-hidden">
                  <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-[#1a1a1a] border-b border-[#262626] text-[#737373] text-[10px] uppercase sticky top-0 z-10">
                        <tr>
                          <th className="p-3 font-normal font-sans whitespace-nowrap">الدفعة</th>
                          <th className="p-3 font-normal font-sans whitespace-nowrap">تاريخ الاستحقاق</th>
                          <th className="p-3 font-normal font-sans whitespace-nowrap">المبلغ</th>
                          <th className="p-3 font-normal font-sans whitespace-nowrap">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {schedule.map((installment, idx) => (
                          <tr key={idx} className="border-b border-[#262626] last:border-0 hover:bg-[#1a1a1a]">
                            <td className="p-3 text-white">#{installment.installmentNumber}</td>
                            <td className="p-3 text-[#ededed] whitespace-nowrap">{new Date(installment.dueDate).toLocaleDateString('en-GB')}</td>
                            <td className="p-3 text-[#10b981] font-bold whitespace-nowrap">{Math.round(installment.amount).toLocaleString()}</td>
                            <td className="p-3">
                              <span className="text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded-sm border border-[#f59e0b]/20 whitespace-nowrap inline-block">انتظار</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setStep(2)} 
                      className="flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded border border-[#262626] hover:bg-[#262626] transition-colors flex-1 sm:flex-none"
                      disabled={isSubmitting}>
                      <ArrowRight size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                          const w = window.open('', '_blank');
                          if(w) {
                              w.document.write('<html dir="rtl"><head><title>جدول دفعات - '+formData.name+'</title>');
                              w.document.write('<style>table { width: 100%; border-collapse: collapse; margin-top: 10px; font-family: sans-serif; font-size: 14px; text-align: right; } th, td { border: 1px solid #ccc; padding: 8px; } th { background-color: #f5f5f5; }</style>');
                              w.document.write('</head><body>');
                              w.document.write('<h2>جدول دفعات - '+formData.name+'</h2>');
                              w.document.write('<p>الهاتف: '+formData.phone+'</p>');
                              w.document.write('<p>مبلغ التمويل: '+cashNeeded.toLocaleString()+' دينار  | الدفعة الشهرية: ' + Math.round(monthlyInstallment).toLocaleString() + ' دينار</p>');
                              w.document.write('<table>');
                              w.document.write('<tr><th>الدفعة</th><th>التاريخ</th><th>المبلغ</th></tr>');
                              schedule.forEach(s => {
                                  w.document.write('<tr><td>#'+s.installmentNumber+'</td><td>'+new Date(s.dueDate).toLocaleDateString('ar-IQ')+'</td><td>'+Math.round(s.amount).toLocaleString()+'</td></tr>');
                              });
                              w.document.write('</table>');
                              w.document.write('</body></html>');
                              w.document.close();
                              w.print();
                          }
                      }} 
                      className="flex items-center justify-center gap-2 text-[#737373] hover:text-white font-bold py-3 px-4 rounded border border-[#262626] bg-[#1a1a1a] hover:bg-[#262626] transition-colors flex-1 sm:flex-none"
                      title="طباعة"
                      disabled={isSubmitting}>
                      <Printer size={18} />
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="flex justify-center flex-1 items-center gap-2 bg-[#10b981] text-black font-bold py-3 px-8 rounded hover:bg-[#34d399] transition-colors disabled:opacity-50">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        جاري الاعتماد...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        تأكيد وإنشاء العقد
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
