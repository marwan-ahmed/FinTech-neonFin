'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, PieChart } from 'lucide-react';

interface GrowthData {
  month: string;
  organizations: number;
}

interface DistributionData {
  name: string;
  loansCount: number;
  totalCapital: number;
}

interface PlatformChartsProps {
  growthData: GrowthData[];
  distributionData: DistributionData[];
}

export default function PlatformCharts({ growthData, distributionData }: PlatformChartsProps) {
  // Format distribution to keep only top 5 or group by other for clean display
  const formattedDistribution = useMemo(() => {
    if (distributionData.length <= 6) return distributionData;
    
    const sorted = [...distributionData].sort((a, b) => b.totalCapital - a.totalCapital);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);
    
    const otherCapital = others.reduce((acc, curr) => acc + curr.totalCapital, 0);
    const otherLoans = others.reduce((acc, curr) => acc + curr.loansCount, 0);
    
    return [
      ...top5,
      {
        name: 'Others',
        loansCount: otherLoans,
        totalCapital: otherCapital
      }
    ];
  }, [distributionData]);

  // Transform and accumulate growth data for Cumulative chart
  const accumulatedGrowth = useMemo(() => {
    let cumulative = 0;
    return growthData.map(d => {
      cumulative += d.organizations;
      
      // Convert 'YYYY-MM' to 'Month YYYY' for display
      const [year, month] = d.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      return {
        rawMonth: d.month,
        displayMonth: label,
        newOrgs: d.organizations,
        cumulativeOrgs: cumulative
      };
    });
  }, [growthData]);

  const hasGrowthData = accumulatedGrowth.length > 0;
  const hasDistData = formattedDistribution.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Chart 1: Cumulative Growth */}
      <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg overflow-hidden p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-white">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Platform Expansion
            </h3>
            <p className="text-xs text-[#737373] mt-0.5">Cumulative SaaS tenants onboarded over time.</p>
          </div>
        </div>
        
        <div className="h-[280px] w-full" dir="ltr">
          {hasGrowthData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accumulatedGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="displayMonth" 
                  stroke="#525252" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#525252" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#737373', fontSize: '11px', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value} tenants`, 'Total Organizations']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeOrgs" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOrgs)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-[#525252]">
              Not enough historical data.
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Loan Capital Distribution */}
      <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] shadow-lg overflow-hidden p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-white">
              <PieChart className="h-4 w-4 text-emerald-400" />
              Capital Distribution by Org
            </h3>
            <p className="text-xs text-[#737373] mt-0.5">Top organizations by total managed capital volume.</p>
          </div>
        </div>

        <div className="h-[280px] w-full" dir="ltr">
          {hasDistData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#525252" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 10)}...` : val}
                />
                <YAxis 
                  stroke="#525252" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#737373', fontSize: '11px', marginBottom: '4px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Managed Capital']}
                />
                <Bar 
                  dataKey="totalCapital" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40}
                >
                  {formattedDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 0 ? '#10b981' : 
                        index === 1 ? '#059669' : 
                        index === 2 ? '#047857' : 
                        '#065f46'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-[#525252]">
              No organizational capital data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
