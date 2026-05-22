'use client';

import React, { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import TenantsTable, { type TenantRow } from '../TenantsTable';
import AddTenantModal from './AddTenantModal';

interface TenantsControlPanelProps {
  enrichedTenants: TenantRow[];
}

export default function TenantsControlPanel({ enrichedTenants }: TenantsControlPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Sub-Header Control Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-dashed border-[#262626] bg-[#0a0a0a]/50">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#0f0f0f] border border-[#262626] flex items-center justify-center flex-shrink-0 shadow-md">
            <Building2 className="h-6 w-6 text-[#737373]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">مكتب تجهيز الفروع</h2>
            <p className="text-sm text-[#525252] mt-0.5">
              إنشاء مساحات عمل منفصلة بمفاتيح مستقلة، وتتبع الموارد، وبروتوكولات الوصول.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/30 hover:bg-red-500 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          إضافة فرع جديد
        </button>
      </div>

      {/* Reusable interactive list with data table */}
      <TenantsTable tenants={enrichedTenants} />

      {/* High-end Creation Modal */}
      <AddTenantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
