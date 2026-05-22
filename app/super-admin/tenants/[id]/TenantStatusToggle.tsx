'use client';

import { useState } from 'react';
import { Power, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TenantStatusToggle({ 
  tenantId, 
  initialStatus 
}: { 
  tenantId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    if (!window.confirm(`هل أنت متأكد أنك تريد ${status === 'active' ? 'تجميد' : 'تفعيل'} هذا الفرع؟`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status === 'active' ? 'frozen' : 'active' })
      });

      if (!res.ok) {
        throw new Error('Failed to toggle status');
      }

      setStatus(status === 'active' ? 'frozen' : 'active');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تغيير حالة الفرع.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
        status === 'active' 
          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
          : 'bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 border border-[#10b981]/20'
      }`}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : status === 'active' ? <AlertCircle className="w-4 h-4" /> : <Power className="w-4 h-4" />}
      {isLoading ? 'جاري المعالجة...' : status === 'active' ? 'تجميد الفرع' : 'تفعيل الفرع'}
    </button>
  );
}
