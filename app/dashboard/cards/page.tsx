'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Coins, 
  Layers, 
  Plus, 
  X, 
  Loader2, 
  Calendar, 
  Percent, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function CardsInventoryPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [batchesRes, investorsRes, loansRes] = await Promise.all([
        fetch('/api/card-batches'),
        fetch('/api/investors'),
        fetch('/api/loans')
      ]);

      if (batchesRes.ok) {
        const batchesData = await batchesRes.json();
        setBatches(batchesData.map((b: any) => ({
          ...b,
          wholesalePrice: parseFloat(b.wholesalePrice || 0),
          totalCost: parseFloat(b.totalCost || 0)
        })));
      }

      if (investorsRes.ok) {
        const investorsData = await investorsRes.json();
        setInvestors(investorsData.map((i: any) => ({
          ...i,
          capital: parseFloat(i.capital || 0)
        })));
      }

      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setLoans(loansData.map((l: any) => ({
          ...l,
          assetValue: parseFloat(l.assetValue || 0)
        })));
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuyCards = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const qty = parseInt(quantity);
    const price = parseFloat(wholesalePrice);
    const cost = qty * price;

    if (cost > liquidCapital) {
      setFormError(`عذراً، التكلفة الإجمالية للطلب (${cost.toLocaleString()} د.ع) تتجاوز رأس المال السائل المتاح (${liquidCapital.toLocaleString()} د.ع)`);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/card-batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchName,
          quantity: qty,
          wholesalePrice: price
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "فشلت عملية شراء البطاقات");
      }

      setShowBuyModal(false);
      setBatchName("");
      setQuantity("");
      setWholesalePrice("");
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const totalCapital = investors.reduce((sum, inv) => sum + (inv.capital || 0), 0);
  const totalBatchesCost = batches.reduce((sum, b) => sum + (b.totalCost || 0), 0);
  
  // Total cash disbursements
  const totalCashLoans = loans
    .filter(l => l.disbursementType === 'cash')
    .reduce((sum, l) => sum + (l.assetValue || 0), 0);

  const liquidCapital = totalCapital - totalBatchesCost - totalCashLoans;
  
  const currentCardAssetVal = batches.reduce((sum, b) => sum + (b.remainingQuantity * b.wholesalePrice), 0);
  const spentCardAssetVal = totalBatchesCost - currentCardAssetVal;
  
  const cardsQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  const remainingCardsQuantity = batches.reduce((sum, b) => sum + b.remainingQuantity, 0);
  const allocatedCardsQuantity = cardsQuantity - remainingCardsQuantity;

  // Percentage Calculations
  const cardAllocationPercent = totalCapital > 0 ? (totalBatchesCost / totalCapital) * 100 : 0;
  const liquidPercent = totalCapital > 0 ? (liquidCapital / totalCapital) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Upper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-[#10b981]" /> مخازن البطاقات والتمويل العيني
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            إدارة وشراء المخزون العيني من البطاقات وتوزيعها كائتمانات للمقترضين بشفافية قانونية كاملة.
          </p>
        </div>
        <button
          onClick={() => setShowBuyModal(true)}
          className="flex items-center justify-center gap-2 rounded bg-[#10b981] px-4 py-3 text-sm font-bold text-black hover:bg-[#34d399] transition-colors shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
        >
          <Plus size={16} /> شراء وجبة بطاقات جملة
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-[#10b981]" size={36} />
          <p className="text-sm text-[#737373]">جاري تحميل مخازن البطاقات والمحفظة...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-500">
          <p className="font-bold">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded text-xs font-bold">إعادة المحاولة</button>
        </div>
      ) : (
        <>
          {/* Dashboard KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI 1: Remaining Liquid Capital */}
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden group hover:border-[#10b981]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 rounded-full blur-2xl group-hover:bg-[#10b981]/10 transition-all duration-300"></div>
              <span className="text-[10px] uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
                <Coins size={14} className="text-[#10b981]" /> رأس المال السائل المتاح (النقد)
              </span>
              <h2 className="text-2xl font-mono font-bold text-white mt-2" dir="ltr">
                {liquidCapital.toLocaleString()} د.ع
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-full bg-[#0f0f0f] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${liquidPercent}%` }}></div>
                </div>
                <span className="text-[10px] font-mono text-[#10b981] font-bold">{liquidPercent.toFixed(1)}%</span>
              </div>
              <p className="text-[9px] text-[#737373] mt-2">المبلغ المتبقي نقدياً للاستثمار والشراء الفوري.</p>
            </div>

            {/* KPI 2: Card Asset Inventory */}
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
              <span className="text-[10px] uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
                <Layers size={14} className="text-blue-400" /> قيمة المخزون الحالي للبطاقات
              </span>
              <h2 className="text-2xl font-mono font-bold text-white mt-2" dir="ltr">
                {currentCardAssetVal.toLocaleString()} / {totalBatchesCost.toLocaleString()} د.ع
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-full bg-[#0f0f0f] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${cardAllocationPercent}%` }}></div>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{cardAllocationPercent.toFixed(1)}%</span>
              </div>
              <p className="text-[9px] text-[#737373] mt-2">القيمة الإجمالية للبطاقات المتوفرة كأصل مادي في الخزينة.</p>
            </div>

            {/* KPI 3: Cards Count Summary */}
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
              <span className="text-[10px] uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
                <Package size={14} className="text-orange-400" /> إجمالي كمية البطاقات
              </span>
              <h2 className="text-2xl font-mono font-bold text-white mt-2" dir="ltr">
                {remainingCardsQuantity.toLocaleString()} / {cardsQuantity.toLocaleString()} كارت
              </h2>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#ededed]">
                <span className="text-orange-400 font-bold">{allocatedCardsQuantity.toLocaleString()} تم صرفها</span>
                <span className="text-[#737373] font-mono">•</span>
                <span className="text-[#737373]">{remainingCardsQuantity.toLocaleString()} متبقية</span>
              </div>
              <p className="text-[9px] text-[#737373] mt-2">إجمالي الكروت التي تم شراؤها وتوزيعها على الائتمانات.</p>
            </div>
          </div>

          {/* Allocation Breakdown Progress Bar */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span>توزيع أصول المحفظة الاستثمارية الكلية ({totalCapital.toLocaleString()} د.ع)</span>
              <span className="text-[#10b981]">شفافية قانونية 100%</span>
            </div>
            <div className="w-full bg-[#0f0f0f] h-3.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-[#10b981] h-full transition-all duration-500" 
                style={{ width: `${liquidPercent}%` }}
                title={`سيولة نقدية: ${liquidPercent.toFixed(1)}%`}
              />
              <div 
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${cardAllocationPercent}%` }}
                title={`بطاقات في المخازن: ${cardAllocationPercent.toFixed(1)}%`}
              />
            </div>
            <div className="flex flex-wrap gap-6 mt-1 text-[11px]">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-[#10b981]"></span>
                سيولة نقدية غير مستغلة ({liquidCapital.toLocaleString()} د.ع - {liquidPercent.toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                أصول بطاقات عينية متوفرة ({currentCardAssetVal.toLocaleString()} د.ع - {((currentCardAssetVal/totalCapital)*100).toFixed(1)}%)
              </span>
              {spentCardAssetVal > 0 && (
                <span className="flex items-center gap-1.5 text-[#737373]">
                  <span className="w-2.5 h-2.5 rounded bg-[#262626]"></span>
                  بطاقات تم صرفها كقروض ({spentCardAssetVal.toLocaleString()} د.ع)
                </span>
              )}
            </div>
          </div>

          {/* Cards Inventory Batches List */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#262626] bg-[#1a1a1a] flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">سجل وجبات البطاقات المشتراة بالمخزن</h3>
              <span className="text-[10px] font-mono text-[#737373]">تحديث فوري للمخازن</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-[#0f0f0f] border-b border-[#262626] text-[10px] uppercase tracking-wider text-[#737373]">
                  <tr>
                    <th className="p-4 font-normal">اسم الوجبة</th>
                    <th className="p-4 font-normal">سعر الجملة للبطاقة</th>
                    <th className="p-4 font-normal">إجمالي التكلفة</th>
                    <th className="p-4 font-normal">المخزون (متبقي / كلي)</th>
                    <th className="p-4 font-normal">معدل التوزيع للائتمانات</th>
                    <th className="p-4 font-normal">تاريخ الشراء</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-mono">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-[#737373]">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Package size={32} className="text-[#262626]" />
                          <p className="text-xs">المستودع فارغ، لم يتم شراء أي وجبة بطاقات بعد.</p>
                          <button
                            onClick={() => setShowBuyModal(true)}
                            className="mt-2 bg-[#ededed] text-black font-bold px-3 py-1.5 rounded text-xs hover:bg-white transition-colors"
                          >
                            شراء أول وجبة بطاقات
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch) => {
                      const sharePercent = batch.quantity > 0 ? ((batch.quantity - batch.remainingQuantity) / batch.quantity) * 100 : 0;
                      return (
                        <tr key={batch.id} className="border-b border-[#262626] hover:bg-[#1a1a1a] transition-colors">
                          <td className="p-4 text-white font-sans font-bold">
                            {batch.batchName}
                          </td>
                          <td className="p-4 text-[#ededed]" dir="ltr">
                            {batch.wholesalePrice.toLocaleString()} د.ع
                          </td>
                          <td className="p-4 text-[#ededed]" dir="ltr">
                            {batch.totalCost.toLocaleString()} د.ع
                          </td>
                          <td className="p-4 text-white">
                            {batch.remainingQuantity.toLocaleString()} / {batch.quantity.toLocaleString()} كارت
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-[#0f0f0f] h-2 rounded-full overflow-hidden">
                                <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${sharePercent}%` }}></div>
                              </div>
                              <span className="text-[10px] text-[#737373]">{sharePercent.toFixed(0)}% تم الصرف</span>
                            </div>
                          </td>
                          <td className="p-4 text-[#737373] text-xs">
                            {new Date(batch.createdAt).toLocaleDateString('ar-IQ')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Buy Cards Batch Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#141414] p-6 relative shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => setShowBuyModal(false)}
              className="absolute top-4 left-4 text-[#737373] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Coins className="text-[#10b981]" /> شراء وجبة بطاقات جديدة
            </h2>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4 flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{formError}</p>
              </div>
            )}

            <form onSubmit={handleBuyCards} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">اسم الوجبة</label>
                <input
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none transition-colors"
                  placeholder="مثال: كارتات آسيا وجبة أيار"
                />
              </div>

              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">كمية البطاقات (كارت)</label>
                <input
                  required
                  type="number"
                  dir="ltr"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#0f0f0f] text-left border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none transition-colors"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">سعر الجملة للبطاقة الواحدة (دينار عراقي)</label>
                <input
                  required
                  type="number"
                  dir="ltr"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full bg-[#0f0f0f] text-left border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none transition-colors"
                  placeholder="5120"
                />
              </div>

              {quantity && wholesalePrice && (
                <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#262626] flex justify-between items-center text-xs">
                  <span className="text-[#737373]">التكلفة الإجمالية للوجبة:</span>
                  <span className="font-mono font-bold text-white" dir="ltr">
                    {(parseInt(quantity) * parseFloat(wholesalePrice)).toLocaleString()} د.ع
                  </span>
                </div>
              )}

              <button
                disabled={isSubmitting}
                type="submit"
                className="mt-4 w-full bg-[#ededed] text-black font-bold py-3 rounded hover:bg-white transition-colors flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} /> تأكيد الشراء من السيولة
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
