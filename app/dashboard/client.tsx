"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, X } from "lucide-react";
import RiskAllocation from "./investments/RiskAllocation";
import NewLoanModal from "@/components/NewLoanModal";

export default function DashboardClient() {
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investorName, setInvestorName] = useState("");
  const [investorCapital, setInvestorCapital] = useState("");
  const [investorType, setInvestorType] = useState("retail");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, investorsRes] = await Promise.all([
        fetch("/api/loans"),
        fetch("/api/investors"),
      ]);
      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setLoans(
          loansData.map((l: any) => ({
            ...l,
            assetValue: parseFloat(l.assetValue || 0),
            totalDebt: parseFloat(l.totalDebt || 0),
          })),
        );
      }
      if (investorsRes.ok) {
        const invData = await investorsRes.json();
        setInvestors(
          invData.map((i: any) => ({
            ...i,
            capital: parseFloat(i.capital || 0),
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error("Request timeout")), 8000);

    const load = async () => {
      try {
        const [loansRes, investorsRes] = await Promise.all([
          fetch("/api/loans", { signal: controller.signal }),
          fetch("/api/investors", { signal: controller.signal }),
        ]);
        clearTimeout(timeoutId);
        if (!active) return;
        if (!loansRes.ok || !investorsRes.ok) {
          setError("تأكد من ضبط متغيرات البيئة (Firebase Admin) في الإعدادات");
        }
        if (loansRes.ok) {
          const loansData = await loansRes.json();
          setLoans(
            loansData.map((l: any) => ({
              ...l,
              assetValue: parseFloat(l.assetValue || 0),
              totalDebt: parseFloat(l.totalDebt || 0),
            })),
          );
        }
        if (investorsRes.ok) {
          const invData = await investorsRes.json();
          setInvestors(
            invData.map((i: any) => ({
              ...i,
              capital: parseFloat(i.capital || 0),
            })),
          );
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.message === "Request timeout") {
           setError("انتهى وقت الاتصال بالخادم، يرجى المحاولة مرة أخرى.");
           return;
        }
        console.error("Error fetching data:", err);
        setError("حدث خطأ في الاتصال بالخادم. تأكد من الإعدادات.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleAddInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: investorName,
          capital: Number(investorCapital),
          type: investorType,
        }),
      });
      if (!res.ok) throw new Error("Failed to add investor");

      setShowInvestorModal(false);
      setInvestorName("");
      setInvestorCapital("");
      setInvestorType("retail");
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalInvestorsCapital = investors.reduce(
    (acc, inv) => acc + (inv.capital || 0),
    0,
  );
  const activeDisbursements = loans.reduce(
    (acc, loan) => acc + (loan.assetValue || 0),
    0,
  );

  const totalDebt = loans.reduce((acc, loan) => acc + (loan.totalDebt || 0), 0);
  const totalPaid = loans.reduce((acc, loan) => {
    if (!loan.schedule || !Array.isArray(loan.schedule)) return acc;
    const paidInLoan = loan.schedule
      .filter((s: any) => s.status === "paid")
      .reduce((sum: number, s: any) => sum + (parseFloat(s.amount) || 0), 0);
    return acc + paidInLoan;
  }, 0);
  const outstandingDebt = totalDebt > 0 ? totalDebt - totalPaid : 0;

  const institutionalCapital = investors
    .filter((i) => i.type === "institutional")
    .reduce((a, b) => a + (b.capital || 0), 0);
  const retailCapital = investors
    .filter((i) => i.type === "retail")
    .reduce((a, b) => a + (b.capital || 0), 0);

  const instPercent =
    totalInvestorsCapital > 0
      ? Math.round((institutionalCapital / totalInvestorsCapital) * 100)
      : 0;
  const retailPercent = totalInvestorsCapital > 0 ? 100 - instPercent : 0;

  return (
    <div className="grid h-full grid-cols-12 gap-6 pb-10 relative">
      {/* Modals */}
      {showLoanModal && (
        <NewLoanModal 
          onClose={() => setShowLoanModal(false)} 
          onSuccess={() => {
            setShowLoanModal(false);
            window.location.reload();
          }} 
        />
      )}
      {showInvestorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#262626] bg-[#141414] p-6 relative">
            <button
              onClick={() => setShowInvestorModal(false)}
              className="absolute top-4 left-4 text-[#737373] hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              إضافة مستثمر جديد
            </h2>
            <form onSubmit={handleAddInvestor} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">
                  اسم المستثمر / المؤسسة
                </label>
                <input
                  required
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none"
                  placeholder="مثال: شركة الأفق"
                />
              </div>
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">
                  نوع المستثمر
                </label>
                <select
                  value={investorType}
                  onChange={(e) => setInvestorType(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none dir-rtl"
                >
                  <option value="retail">أفراد / صغار</option>
                  <option value="institutional">مؤسسات</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#737373] uppercase mb-1 block">
                  رأس المال المستثمر (دينار)
                </label>
                <input
                  required
                  type="number"
                  dir="ltr"
                  value={investorCapital}
                  onChange={(e) => setInvestorCapital(e.target.value)}
                  className="w-full bg-[#0f0f0f] text-left border border-[#262626] rounded px-3 py-2 text-white focus:border-[#10b981] outline-none"
                  placeholder="5000000"
                />
              </div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="mt-4 w-full bg-[#ededed] text-black font-bold py-3 rounded hover:bg-white transition-colors flex justify-center items-center"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "تأكيد الإضافة"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Left Column: KPI Metrics */}
      <section className="col-span-12 flex flex-col gap-6 lg:col-span-3">
        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5 relative overflow-hidden transition-all duration-300 hover:border-[#10b981]/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 rounded-full blur-xl group-hover:bg-[#10b981]/10 transition-all duration-300"></div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373] relative z-10">
            إجمالي رأس المال
          </span>
          <h2
            className="font-mono text-3xl tracking-tighter text-[#ededed] relative z-10"
            dir="ltr"
          >
            {totalInvestorsCapital.toLocaleString("en-US")} د.ع
          </h2>
          <div className="mt-2 flex items-center gap-2 relative z-10">
            <span className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-[11px] text-[#10b981] font-bold">نمو مستقر ومحمي</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5 transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373] relative z-10">
            المدفوعات النشطة (رأس المال كقروض)
          </span>
          <h2
            className="font-mono text-3xl tracking-tighter text-[#ededed] relative z-10"
            dir="ltr"
          >
            {activeDisbursements.toLocaleString("en-US")} د.ع
          </h2>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#262626] relative z-10">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${totalInvestorsCapital > 0 ? Math.min(100, (activeDisbursements / totalInvestorsCapital) * 100) : 0}%`,
              }}
            ></div>
          </div>
          <span className="mt-1 text-[10px] text-[#737373] relative z-10">
            معدل الاستخدام{" "}
            {totalInvestorsCapital > 0
              ? Math.round((activeDisbursements / totalInvestorsCapital) * 100)
              : 0}
            %
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5 transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-all duration-300"></div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373] relative z-10">
            إجمالي الديون (المطلوبة للتسديد)
          </span>
          <h2
            className="font-mono text-2xl tracking-tighter text-[#ededed] relative z-10"
            dir="ltr"
          >
            {totalDebt.toLocaleString("en-US")} د.ع
          </h2>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5 transition-all duration-300 hover:border-[#10b981]/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 rounded-full blur-xl group-hover:bg-[#10b981]/10 transition-all duration-300"></div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373] relative z-10">
            إجمالي المبالغ المسددة
          </span>
          <h2
            className="font-mono text-2xl tracking-tighter text-[#10b981] relative z-10"
            dir="ltr"
          >
            {totalPaid.toLocaleString("en-US")} د.ع
          </h2>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#262626] relative z-10">
            <div
              className="h-full bg-[#10b981] transition-all duration-500"
              style={{
                width: `${totalDebt > 0 ? Math.min(100, (totalPaid / totalDebt) * 100) : 0}%`,
              }}
            ></div>
          </div>
          <span className="mt-1 text-[10px] text-[#737373] relative z-10">
            نسبة التسديد الكلية:{" "}
            {totalDebt > 0
              ? Math.round((totalPaid / totalDebt) * 100)
              : 0}
            %
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5 transition-all duration-300 hover:border-[#f59e0b]/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/5 rounded-full blur-xl group-hover:bg-[#f59e0b]/10 transition-all duration-300"></div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373] relative z-10">
            المبالغ المتبقية غير المسددة
          </span>
          <h2
            className="font-mono text-2xl tracking-tighter text-[#f59e0b] relative z-10"
            dir="ltr"
          >
            {outstandingDebt.toLocaleString("en-US")} د.ع
          </h2>
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-[#262626] bg-[#141414] p-5 transition-all duration-300 hover:border-[#737373]/50 relative overflow-hidden group">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373]">
            مؤشر التعرض للمخاطر
          </span>
          <h2 className="font-mono text-3xl tracking-tighter text-[#737373]">
            0.00%
          </h2>
          <p className="mt-2 text-[11px] italic text-[#737373]">
            بانتظار بيانات كافية للحساب
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <button
            onClick={() => setShowLoanModal(true)}
            className="flex justify-center items-center gap-2 w-full rounded bg-[#10b981] py-4 text-sm font-bold text-black transition-colors hover:bg-[#34d399] shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
          >
            <Plus size={18} />
            تسهيلات ائتمانية جديدة
          </button>
          <button
            onClick={() => setShowInvestorModal(true)}
            className="flex justify-center items-center gap-2 w-full rounded border border-[#262626] bg-[#1a1a1a] py-4 text-sm font-bold text-white transition-colors hover:bg-[#262626]"
          >
            <Plus size={18} />
            إضافة مستثمر
          </button>
        </div>
      </section>

      {/* Middle Column: Main Table */}
      <section className="col-span-12 flex flex-col overflow-hidden rounded-lg border border-[#262626] bg-[#141414] lg:col-span-6">
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#1a1a1a] p-5">
          <h3 className="text-sm font-bold tracking-tight uppercase text-[#ededed]">
            محفظة القروض النشطة
          </h3>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-[#737373] hidden sm:inline-block">
              تحديث فوري للبيانات
            </span>
            <button
              onClick={() => setShowLoanModal(true)}
              className="flex items-center gap-1.5 rounded bg-[#10b981] px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-[#34d399]"
            >
              <Plus size={14} />
              ائتمان جديد
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b border-[#262626] bg-[#0f0f0f] text-[10px] uppercase tracking-wider text-[#737373]">
              <tr>
                <th className="p-4 font-normal">المقترض</th>
                <th className="p-4 font-normal">قيمة الأصل</th>
                <th className="p-4 font-normal">المدة</th>
                <th className="p-4 font-normal">الاستحقاق القادم</th>
                <th className="p-4 font-normal">التصنيف</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#737373]">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin text-[#10b981]" />
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-[#ef4444]">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <p>{error || "حدث خطأ في الاتصال. الرجاء التأكد من الإعدادات."}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 rounded bg-[#262626] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#404040]"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-[#737373]">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <p>لا توجد قروض مسجلة بعد.</p>
                      <button
                        onClick={() => setShowLoanModal(true)}
                        className="inline-flex flex-row items-center gap-2 rounded bg-[#10b981] px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-[#34d399]"
                      >
                        <Plus size={16} />
                        تسهيلات ائتمانية جديدة
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr
                    key={loan.id}
                    onClick={() => router.push(`/dashboard/loans/${loan.id}`)}
                    className="cursor-pointer border-b border-[#262626] transition-colors hover:bg-[#1a1a1a]"
                  >
                    <td className="p-4 text-white font-sans">
                      {loan.borrowerName || loan.borrowerId || 'غير معروف'}
                    </td>
                    <td className="p-4 text-[#ededed]" dir="ltr">
                      {(loan.assetValue || 0).toLocaleString()} د.ع
                    </td>
                    <td className="p-4 text-[#737373]">{loan.tenure} شهر</td>
                    <td className="p-4 text-[#ededed]">
                      {new Date(loan.nextDue).toLocaleDateString("ar-IQ")}
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          loan.score === "B-"
                            ? "text-[#f59e0b]"
                            : "text-[#10b981]"
                        }
                      >
                        {loan.score || "A"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Column: Risk & Analytics */}
      <section className="col-span-12 flex flex-col gap-6 lg:col-span-3">
        <div className="rounded-lg border border-[#262626] bg-[#141414] p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ededed]">
            توزيع المستثمرين
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-[#737373]">مؤسسات</p>
                  <p className="font-mono text-lg text-[#ededed]">
                    {institutionalCapital.toLocaleString("en-US")} د.ع
                  </p>
                </div>
                <span className="mb-1 text-[10px] text-[#10b981]">
                  نسبة {instPercent}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-[#262626] mt-1">
                <div
                  className="h-full bg-[#10b981]"
                  style={{ width: `${instPercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-[#737373]">أفراد / صغار</p>
                  <p className="font-mono text-lg text-[#ededed]">
                    {retailCapital.toLocaleString("en-US")} د.ع
                  </p>
                </div>
                <span className="mb-1 text-[10px] text-[#10b981]">
                  نسبة {retailPercent}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-[#262626] mt-1">
                <div
                  className="h-full bg-[#10b981]"
                  style={{ width: `${retailPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#ededed]">
            تنبيهات النظام الذكية
          </h3>
          <div className="space-y-4">
            {/* Smart Alerts: Proposal 5 */}
            {now &&
            loans.filter(
              (l) =>
                new Date(l.nextDue).getTime() - now < 7 * 86400000 &&
                l.status === "active",
            ).length > 0 ? (
              loans
                .filter(
                  (l) =>
                    new Date(l.nextDue).getTime() - now < 7 * 86400000 &&
                    l.status === "active",
                )
                .map((loan: any, i: number) => {
                  const installmentAmount = Math.round(loan.totalDebt / (loan.tenure || 1));
                  const borrowerDisplay = loan.borrowerName || loan.borrowerId || 'غير معروف';
                  const nextSch = loan.schedule?.find((s: any) => s.status === 'pending');
                  const instNum = nextSch ? nextSch.installmentNumber : 1;

                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-2.5 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3.5 transition-all duration-300 hover:border-orange-500/60 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)] animate-pulse"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-orange-400">
                              استحقاق سداد قريب (قسط #{instNum})
                            </p>
                            <span className="text-[9px] font-mono text-orange-400/70 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                              {new Date(loan.nextDue).toLocaleDateString("ar-IQ")}
                            </span>
                          </div>
                          <p className="text-[10px] text-orange-400/90 mt-1 leading-relaxed">
                            المطلوب من الزبون <strong className="text-white font-bold">{borrowerDisplay}</strong> سداد مبلغ وقدره <span className="font-mono font-bold text-white">{installmentAmount.toLocaleString()}</span> د.ع.
                          </p>
                        </div>
                      </div>

                      {/* Embed micro-action buttons */}
                      <div className="flex items-center justify-end gap-2 border-t border-orange-500/20 pt-2 mt-0.5">
                        <a
                          href={`https://wa.me/${loan.phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(`مرحباً السيد/ة ${borrowerDisplay}، نود تذكيركم بقرب موعد استحقاق القسط رقم #${instNum} البالغ ${installmentAmount.toLocaleString()} دينار عراقي بتاريخ ${new Date(loan.nextDue).toLocaleDateString("ar-IQ")}. شكراً لتعاونكم.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold bg-[#141414] text-[#ededed] border border-[#262626] hover:border-green-500/50 hover:text-green-400 px-2.5 py-1 rounded transition-all flex items-center gap-1"
                        >
                          <span className="w-1 h-1 rounded-full bg-green-500"></span>
                          تذكير واتساب
                        </a>
                        <Link
                          href={`/dashboard/loans/${loan.id}`}
                          className="text-[9px] font-bold bg-orange-500 text-black hover:bg-orange-400 px-2.5 py-1 rounded transition-all shadow-sm font-mono flex items-center gap-1"
                        >
                          تسجيل الدفعة ←
                        </Link>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="flex items-start gap-3 rounded border border-[#262626] bg-[#0f0f0f] p-3">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-[11px] font-bold text-green-500">
                    لا يوجد استحقاقات قريبة
                  </p>
                  <p className="text-[10px] text-[#737373] mt-0.5">
                    جدول الدفعات القادمة يسير بشكل طبيعي.
                  </p>
                </div>
              </div>
            )}

            {/* Smart Alerts: Idle Capital */}
            {totalInvestorsCapital > 0 &&
            (totalInvestorsCapital - activeDisbursements) /
              totalInvestorsCapital >
              0.3 ? (
              <div className="flex items-start gap-3 rounded border border-blue-500/30 bg-blue-500/10 p-3">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-[11px] font-bold text-blue-400">
                    فرصة استثمارية: سيولة غير مستغلة
                  </p>
                  <p className="text-[10px] text-blue-400/80 mt-0.5">
                    هناك أكثر من 30% من رأس المال غير مستغل (
                    {(
                      totalInvestorsCapital - activeDisbursements
                    ).toLocaleString()}{" "}
                    د.ع). ينصح بفتح خطوط ائتمانية التزاماً بالعوائد.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Default Collection Text */}
            <div className="mt-6 border-t border-[#262626] pt-4">
              <p className="text-[11px] font-bold text-white mb-2">
                محرك التحصيل الآلي
              </p>
              <div className="flex justify-between items-center text-[10px] text-[#737373]">
                <span>نجاح السحب التلقائي (آخر 24س):</span>
                <span className="font-mono text-white">0%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Risk Analytics */}
      {(investors.length > 0 || loans.length > 0) && !loading && (
        <section className="col-span-12">
          <RiskAllocation investors={investors} loans={loans} />
        </section>
      )}
    </div>
  );
}
