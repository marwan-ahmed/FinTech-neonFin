"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Loader2, TrendingUp, DollarSign, Target, Activity } from "lucide-react";

export default function ReportsPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchLoans = async () => {
      try {
        const res = await fetch("/api/loans");
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!res.ok) throw new Error("فشل في جلب البيانات");
        const data = await res.json();
        if (active) setLoans(data);
      } catch (err: any) {
        if (active) setError(err.message || "حدث خطأ ما");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLoans();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#10b981]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // --- KPI Calculation ---
  const totalCapital = loans.reduce((acc, l) => acc + parseFloat(l.assetValue || 0), 0);
  const totalExpectedReturn = loans.reduce((acc, l) => acc + parseFloat(l.totalDebt || 0), 0);
  const expectedProfit = totalExpectedReturn - totalCapital;

  let totalCollected = 0;
  let defaultAmount = 0;
  let lateInstallmentsCount = 0;

  loans.forEach((loan) => {
    if (loan.schedule && Array.isArray(loan.schedule)) {
      loan.schedule.forEach((s: any) => {
        totalCollected += parseFloat(s.paidAmount || 0);
        if (s.status === "pending" && new Date(s.dueDate) < new Date()) {
          lateInstallmentsCount++;
          defaultAmount += (parseFloat(s.amount || 0) - parseFloat(s.paidAmount || 0));
        }
      });
    }
  });

  const collectionRate = totalExpectedReturn > 0 ? (totalCollected / totalExpectedReturn) * 100 : 0;
  const portfolioAtRisk = totalCapital > 0 ? (defaultAmount / totalCapital) * 100 : 0;

  // --- Chart Data Preparation ---

  // 1. Status Pie Chart
  const statusCounts = {
    active: loans.filter((l) => l.status === "active").length,
    completed: loans.filter((l) => l.status === "completed").length,
    late: loans.filter((l) => l.schedule?.some((s: any) => s.status === "pending" && new Date(s.dueDate) < new Date())).length
  };
  const pieData = [
    { name: "نشط وملتزم", value: statusCounts.active - statusCounts.late, color: "#3b82f6" },
    { name: "متأخر", value: statusCounts.late, color: "#ef4444" },
    { name: "مكتمل", value: statusCounts.completed, color: "#10b981" },
  ].filter(d => d.value > 0);

  // 2. Monthly Collection vs Expected (Last 6 Months & Future 6 Months)
  // Aggregate by YYYY-MM
  const monthlyDataMap: Record<string, { month: string, collected: number, expected: number }> = {};
  
  loans.forEach(loan => {
    if (loan.schedule) {
      loan.schedule.forEach((s: any) => {
        const dueDate = new Date(s.dueDate);
        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyDataMap[monthKey]) {
          monthlyDataMap[monthKey] = { month: `${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`, collected: 0, expected: 0 };
        }
        
        monthlyDataMap[monthKey].expected += parseFloat(s.amount || 0);
        monthlyDataMap[monthKey].collected += parseFloat(s.paidAmount || 0);
      });
    }
  });

  const lineData = Object.entries(monthlyDataMap)
    .sort((a, b) => a[0].localeCompare(b[0])) // Sort chronologically
    .map(entry => entry[1]);

  return (
    <div className="flex h-full flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">التقارير والإحصائيات</h2>
          <p className="mt-1 text-sm text-[#737373]">
            نظرة شاملة لسلامة المحفظة، المبالغ المحصلة، والأرباح المتوقعة.
          </p>
        </div>
        <button
          onClick={() => {
            const reportHTML = `<html dir="rtl">
              <head>
                <title>تقرير أداء المحفظة - neonFin</title>
                <style>
                  *{margin:0;padding:0;box-sizing:border-box}
                  body{font-family:'Segoe UI',sans-serif;color:#1a1a1a;padding:40px}
                  .brand{text-align:center;padding-bottom:20px;border-bottom:3px solid #10b981;margin-bottom:24px}
                  .brand h1{font-size:28px;color:#10b981;letter-spacing:2px}
                  .brand p{color:#666;font-size:12px}
                  .title{text-align:center;margin:16px 0;font-size:18px;font-weight:bold;color:#064e3b}
                  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}
                  .card{padding:14px;border:1px solid #e5e7eb;border-radius:6px;background:#fafafa}
                  .card label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:2px}
                  .card span{font-size:16px;font-weight:bold}
                  table{width:100%;border-collapse:collapse;margin:16px 0;font-size:12px}
                  th{background:#f9fafb;padding:8px;border:1px solid #e5e7eb;font-size:10px;text-transform:uppercase;color:#666}
                  td{padding:8px;border:1px solid #e5e7eb;text-align:center}
                  .footer{margin-top:40px;text-align:center;font-size:11px;color:#999;border-top:1px dashed #ccc;padding-top:12px}
                  @media print{body{padding:20px}}
                </style>
              </head>
              <body>
                <div class="brand"><h1>neonFin</h1><p>منصة الحلول المالية المتكاملة</p></div>
                <div class="title">تقرير أداء المحفظة الائتمانية - ${new Date().toLocaleDateString('ar-IQ')}</div>
                <div class="grid">
                  <div class="card"><label>الأرباح المتوقعة</label><span style="color:#10b981">${expectedProfit.toLocaleString()} د.ع</span></div>
                  <div class="card"><label>إجمالي المحصّل</label><span>${totalCollected.toLocaleString()} د.ع</span></div>
                  <div class="card"><label>نسبة التحصيل</label><span>${collectionRate.toFixed(1)}%</span></div>
                  <div class="card"><label>المحفظة في خطر</label><span style="color:#ef4444">${portfolioAtRisk.toFixed(2)}%</span></div>
                </div>
                <table>
                  <thead><tr><th>المقترض</th><th>المبلغ</th><th>المديونية</th><th>الحالة</th><th>التصنيف</th></tr></thead>
                  <tbody>${loans.map((l: any) => `<tr>
                    <td style="font-weight:bold">${l.borrowerName}</td>
                    <td style="font-family:monospace">${parseFloat(l.assetValue||0).toLocaleString()}</td>
                    <td style="font-family:monospace">${parseFloat(l.totalDebt||0).toLocaleString()}</td>
                    <td>${l.status === 'active' ? 'نشط' : l.status === 'completed' ? 'مكتمل' : 'متعثر'}</td>
                    <td style="font-weight:bold;color:${l.score === 'C' ? '#ef4444' : l.score === 'B' ? '#f59e0b' : '#10b981'}">${l.score || 'A'}</td>
                  </tr>`).join('')}</tbody>
                </table>
                <div class="footer">تم التصدير آلياً بواسطة نظام neonFin &copy; ${new Date().getFullYear()}</div>
                <script>window.onload=()=>{window.print();}</script>
              </body>
            </html>`;
            const w = window.open('', '_blank');
            if (w) { w.document.open(); w.document.write(reportHTML); w.document.close(); }
          }}
          className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#10b981]/20 transition-colors"
        >
          <TrendingUp size={15} />
          <span>تصدير تقرير المحفظة</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <div className="flex items-center text-[#737373]">
            <Target className="ml-2 h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">الأرباح المتوقعة</span>
          </div>
          <h3 className="font-mono text-2xl font-bold text-[#10b981]" dir="ltr">
            {expectedProfit.toLocaleString()} د.ع
          </h3>
          <p className="text-xs text-[#737373]">إجمالي العوائد المستقبلية</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <div className="flex items-center text-[#737373]">
            <DollarSign className="ml-2 h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">السيولة المستردة (المسدد)</span>
          </div>
          <h3 className="font-mono text-2xl font-bold text-white" dir="ltr">
            {totalCollected.toLocaleString()} د.ع
          </h3>
          <p className="text-xs text-[#737373]">بنسبة تحصيل {collectionRate.toFixed(1)}%</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <div className="flex items-center text-[#737373]">
            <TrendingUp className="ml-2 h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">إجمالي القروض المصروفة</span>
          </div>
          <h3 className="font-mono text-2xl font-bold text-white" dir="ltr">
            {totalCapital.toLocaleString()} د.ع
          </h3>
          <p className="text-xs text-[#737373]">رأس المال العامل حالياً</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[#262626] bg-[#141414] p-5">
          <div className="flex items-center text-[#737373]">
            <Activity className="ml-2 h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">المبالغ المتأخرة المخاطر</span>
          </div>
          <h3 className="font-mono text-2xl font-bold text-[#ef4444]" dir="ltr">
            {defaultAmount.toLocaleString()} د.ع
          </h3>
          <p className="text-xs text-[#737373]">محفظة في خطر بنسبة {portfolioAtRisk.toFixed(2)}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Line Chart */}
        <div className="col-span-1 lg:col-span-2 flex flex-col rounded-lg border border-[#262626] bg-[#141414] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">التدفقات النقدية (المسدد مقابل المستحق)</h3>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" stroke="#737373" fontSize={12} tickMargin={10} />
                <YAxis stroke="#737373" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#262626', color: '#fff' }}
                  itemStyle={{ color: '#ededed' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} د.ع`, '']}
                />
                <Legend />
                <Line type="monotone" name="المستحق" dataKey="expected" stroke="#737373" strokeWidth={2} dot={false} />
                <Line type="monotone" name="المسدد الفعلي" dataKey="collected" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-1 flex flex-col rounded-lg border border-[#262626] bg-[#141414] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">توزيع حالة القروض</h3>
          <div className="flex h-[300px] w-full items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#262626', color: '#fff' }}
                    itemStyle={{ color: '#ededed' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-[#737373]">لا توجد بيانات كافية</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
