"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { ShieldAlert, ShieldCheck, Shield, Activity, TrendingUp } from "lucide-react";

interface RiskAllocationProps {
  investors: any[];
  loans: any[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-[#1a1a1a] border border-[#262626] p-3 rounded-lg shadow-xl text-sm"
        dir="rtl"
      >
        <p className="text-white font-bold">{payload[0].name}</p>
        <p className="text-[#10b981] font-mono mt-1">
          {Number(payload[0].value).toLocaleString()} د.ع
        </p>
      </div>
    );
  }
  return null;
};

export default function RiskAllocation({
  investors,
  loans,
}: RiskAllocationProps) {
  // Calculations
  const totalCapital = investors.reduce(
    (sum, inv) => sum + (inv.capital || 0),
    0,
  );

  // Deployed capital that is currently active and outstanding
  const activeOutstandingLoans = loans.filter(
    (l) => l.status === "active" || l.status === "approved",
  );
  const activeInvestedAmount = activeOutstandingLoans.reduce(
    (sum, loan) => sum + (loan.totalDebt || 0),
    0,
  );

  const defaultedLoans = loans.filter((l) => l.status === "defaulted");
  const defaultedAmount = defaultedLoans.reduce(
    (sum, l) => sum + (l.totalDebt || 0),
    0,
  );

  // Total current portfolio assets locked in loans
  const totalInvested = activeInvestedAmount + defaultedAmount;

  // Liquid cash available to lend. Restricts completed loans from draining liquidity.
  const liquidCash = Math.max(0, totalCapital - totalInvested);

  // Effective Total Portfolio Value for accurate 100% distribution display
  const totalPortfolioValue = liquidCash + activeInvestedAmount + defaultedAmount;

  // Health Score (0-100)
  let healthScore = 100;
  const defaultRatio = totalPortfolioValue > 0 ? defaultedAmount / totalPortfolioValue : 0;
  const liquidRatio = totalPortfolioValue > 0 ? liquidCash / totalPortfolioValue : 0;

  healthScore -= defaultRatio * 200; // 10% default means -20 score
  if (liquidRatio > 0.6) healthScore -= 15; // penalize too much idle cash
  if (healthScore < 0) healthScore = 0;
  if (Number.isNaN(healthScore)) healthScore = 100;

  const getHealthColor = (score: number) => {
    if (score >= 85) return "text-[#10b981]"; // Emerald
    if (score >= 60) return "text-orange-500"; // Orange
    return "text-red-500"; // Red
  };

  const getHealthIcon = (score: number) => {
    if (score >= 85) return <ShieldCheck className="w-8 h-8 text-[#10b981]" />;
    if (score >= 60) return <Shield className="w-8 h-8 text-orange-500" />;
    return <ShieldAlert className="w-8 h-8 text-red-500" />;
  };

  // Chart Data: Asset Allocation
  const allocationData = [
    { name: "سيولة متاحة", value: liquidCash, color: "#10b981" }, // Emerald
    {
      name: "قروض نشطة",
      value: activeInvestedAmount,
      color: "#3b82f6",
    }, // Blue
    { name: "قروض متعثرة", value: defaultedAmount, color: "#ef4444" }, // Red
  ];

  // Chart Data: Risk by Score
  const scoreGroups = {
    "A (منخفضة)": 0,
    "B (متوسطة)": 0,
    "C (عالية)": 0,
  };

  loans.forEach((loan) => {
    const s = loan.score || "A";
    const amount = loan.totalDebt || 0;
    if (s === "A") scoreGroups["A (منخفضة)"] += amount;
    else if (s === "B") scoreGroups["B (متوسطة)"] += amount;
    else scoreGroups["C (عالية)"] += amount;
  });

  const riskData = [
    {
      name: "Low Risk (A)",
      amount: scoreGroups["A (منخفضة)"],
      fill: "#10b981",
    },
    {
      name: "Medium Risk (B)",
      amount: scoreGroups["B (متوسطة)"],
      fill: "#f59e0b",
    },
    {
      name: "High Risk (C)",
      amount: scoreGroups["C (عالية)"],
      fill: "#ef4444",
    },
  ];

  // ── 3.1: Cash Flow Forecast (next 6 months) ──────────────────────────
  const cashFlowForecast = useMemo(() => {
    const now = new Date();
    const months: { month: string; expected: number; cumulative: number }[] = [];
    let cumulative = 0;

    for (let m = 0; m < 6; m++) {
      const start = new Date(now.getFullYear(), now.getMonth() + m, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + m + 1, 0, 23, 59, 59);
      const monthLabel = start.toLocaleDateString('ar-IQ', { month: 'short', year: 'numeric' });

      let monthTotal = 0;
      loans.forEach((loan: any) => {
        if (loan.status !== 'active' && loan.status !== 'approved') return;
        const schedule = loan.schedule || [];
        schedule.forEach((s: any) => {
          if (s.status === 'paid') return;
          const due = new Date(s.dueDate);
          if (due >= start && due <= end) {
            const amount = parseFloat(s.amount || '0');
            const paid = parseFloat(s.paidAmount || '0');
            monthTotal += Math.max(0, amount - paid);
          }
        });
      });

      cumulative += monthTotal;
      months.push({ month: monthLabel, expected: Math.round(monthTotal), cumulative: Math.round(cumulative) });
    }
    return months;
  }, [loans]);

  const hasForecastData = cashFlowForecast.some(m => m.expected > 0);

  const ForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#262626] p-3 rounded-lg shadow-xl text-sm" dir="rtl">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-[#10b981] font-mono text-xs">المتوقع: {Number(payload[0]?.value).toLocaleString()} د.ع</p>
          {payload[1] && <p className="text-[#3b82f6] font-mono text-xs">التراكمي: {Number(payload[1]?.value).toLocaleString()} د.ع</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      {/* Portfolio Health Card */}
      <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              تقييم صحة المحفظة
            </h3>
            {getHealthIcon(healthScore)}
          </div>
          <p className="text-[#737373] text-xs leading-relaxed mb-6">
            يعتمد التقييم على نسبة القروض المتعثرة ومعدلات استغلال السيولة
            المتاحة مقابل رأس المال النشط.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-4 relative">
          <Activity size={100} className="absolute opacity-5 text-[#262626]" />
          <div
            className={`text-6xl font-black font-mono tracking-tighter ${getHealthColor(healthScore)}`}
          >
            {Math.round(healthScore)}
            <span className="text-2xl text-[#737373] ml-1">%</span>
          </div>
          <p className="text-sm text-[#737373] mt-2 font-bold">Health Score</p>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          توزيع الأصول والسيولة
        </h3>
        <p className="text-xs text-[#737373] mb-4">
          توزيع رأس المال بين النقد المتاح والقروض المستثمرة.
        </p>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around items-center mt-2 border-t border-[#262626] pt-4">
          {allocationData.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-[#737373] uppercase">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-mono text-white">
                {item.value > 0
                  ? `${((item.value / (totalPortfolioValue || 1)) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          المخاطر حسب الفئة
        </h3>
        <p className="text-xs text-[#737373] mb-4">
          يستند إلى درجات التقييم (Score) للقروض النشطة.
        </p>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={riskData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#262626"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#737373",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
                width={90}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={30}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 3.1: Cash Flow Forecast ───────────────────────────────────── */}
      <div className="lg:col-span-3 bg-[#141414] border border-[#262626] rounded-lg p-5 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              توقعات التدفق النقدي (6 أشهر)
            </h3>
          </div>
          {hasForecastData && (
            <span className="text-[10px] font-mono text-[#737373] bg-[#0f0f0f] border border-[#262626] px-2 py-0.5 rounded">
              إجمالي متوقع: {cashFlowForecast[cashFlowForecast.length - 1]?.cumulative.toLocaleString()} د.ع
            </span>
          )}
        </div>
        <p className="text-xs text-[#737373] mb-4">
          يوضح حجم السيولة المتوقع دخولها للمحفظة بناءً على جداول استحقاق الأقساط النشطة.
        </p>
        {hasForecastData ? (
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowForecast} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(v) => v > 0 ? `${(v / 1000).toFixed(0)}K` : '0'}
                  width={50}
                />
                <Tooltip content={<ForecastTooltip />} />
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#forecastGradient)"
                  name="المتوقع شهرياً"
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  fill="url(#cumulativeGradient)"
                  name="التراكمي"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 min-h-[120px] flex items-center justify-center text-[#737373] text-xs italic">
            لا توجد أقساط مستحقة خلال الأشهر الستة القادمة.
          </div>
        )}
        {hasForecastData && (
          <div className="flex justify-around items-center mt-3 border-t border-[#262626] pt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-[2px] bg-[#10b981] rounded"></div>
              <span className="text-[10px] text-[#737373]">الدخل الشهري المتوقع</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-[2px] bg-[#3b82f6] rounded" style={{borderTop: '2px dashed #3b82f6'}}></div>
              <span className="text-[10px] text-[#737373]">التراكمي</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
