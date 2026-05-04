'use client';

import { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  tenantId: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit-logs');
      if (!res.ok) throw new Error('فشل جلب سجل المراقبة');
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-500/10 text-green-500';
    if (action.includes('PAY') || action.includes('CLEAR')) return 'bg-blue-500/10 text-blue-500';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'bg-red-500/10 text-red-500';
    if (action.includes('UPDATE')) return 'bg-orange-500/10 text-orange-500';
    return 'bg-gray-500/10 text-gray-500';
  };

  const getActionLabel = (action: string) => {
    const dictionary: Record<string, string> = {
      'CREATE_LOAN': 'إنشاء قرض',
      'PAY_INSTALLMENT': 'تسديد قسط',
      'CLEAR_LOAN': 'تصفية قرض',
      'UPDATE_KYC': 'تحديث ملف KYC',
      'CREATE_INVESTOR': 'إنشاء مستثمر',
    };
    return dictionary[action] || action;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">سجل المراقبة (Audit Logs)</h1>
        <button 
          onClick={fetchLogs} 
          className="text-sm bg-[#262626] hover:bg-[#333] text-white px-4 py-2 rounded-md transition-colors"
        >
          تحديث السجل
        </button>
      </div>

      <div className="bg-[#171717] border border-[#262626] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#262626]">
          <h2 className="text-lg font-medium text-white">سجل العمليات المالية والإدارية</h2>
          <p className="text-sm text-[#737373] mt-1">تتبع كافة الإجراءات الحساسة التي تمت في النظام لضمان الامتثال والمساءلة.</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-[#737373]">جاري تحميل السجلات...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[#737373]">لا توجد سجلات بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#1c1c1c] text-[#737373]">
                <tr>
                  <th className="px-6 py-4 font-medium text-right">التاريخ والوقت</th>
                  <th className="px-6 py-4 font-medium text-right">المستخدم / المسؤول</th>
                  <th className="px-6 py-4 font-medium text-right">نوع الإجراء</th>
                  <th className="px-6 py-4 font-medium text-right">الكيان المتأثر</th>
                  <th className="px-6 py-4 font-medium text-right">تفاصيل فنية (JSON)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4 text-[#a3a3a3] text-right" dir="ltr">
                      {new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(log.createdAt))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.userName ? (
                        <div>
                          <div className="text-white font-medium">{log.userName}</div>
                          <div className="text-xs text-[#737373]">{log.userEmail}</div>
                        </div>
                      ) : (
                        <span className="text-[#737373]">نظام تلقائي</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#a3a3a3] text-right font-mono text-xs">
                      {log.entityType} ({log.entityId.substring(0, 8)}...)
                    </td>
                    <td className="px-6 py-4 text-left max-w-xs truncate" dir="ltr">
                      <pre className="text-xs text-[#737373] bg-[#111] p-2 rounded-md overflow-x-auto border border-[#262626] whitespace-pre-wrap max-h-24">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
