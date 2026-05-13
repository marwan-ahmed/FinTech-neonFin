'use client';

import React, { useState } from 'react';
import { X, Plus, Building2, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTenantModal({ isOpen, onClose }: AddTenantModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/super-admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to onboard organization');
      }

      setSuccess(true);
      setName('');
      
      // Let user enjoy the success visual briefly, then reload & close
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-md animate-fade-in">
      {/* Modal Wrapper */}
      <div 
        className="relative w-full max-w-md rounded-xl bg-[#0f0f0f] border border-[#262626] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden animate-scale-in"
      >
        {/* Top Gradient Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#262626] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Provision Space</h3>
              <p className="text-xs text-[#737373]">Onboard a new SaaS tenant organization.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#737373] hover:text-white rounded-md p-1 hover:bg-[#262626] transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-fade-in">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <p>Space successfully created! Refreshing grid...</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="org-name" className="text-[11px] uppercase tracking-widest font-bold text-[#737373]">
                Organization Name
              </label>
              <input
                id="org-name"
                type="text"
                required
                placeholder="e.g. Alpha FinTech, Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting || success}
                className="w-full bg-[#0a0a0a] border border-[#262626] text-white text-sm rounded-md px-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-[#525252]"
                autoFocus
              />
            </div>

            {/* Multi-tenancy Advisory Warning */}
            <div className="bg-[#141414] rounded-md p-3.5 border border-[#262626] text-[10px] text-[#525252] leading-relaxed">
              <span className="text-[#a3a3a3] font-semibold mr-1 uppercase">SYSTEM NOTICE:</span>
              Provisioning a new workspace creates isolated schemas and structural keys. This action maps explicitly into globally-replicated tables and logs to Root Audits.
            </div>
          </div>

          {/* Actions Footer */}
          <div className="px-6 py-4 border-t border-[#262626] bg-[#0a0a0a] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || success}
              className="px-4 py-2 text-xs font-bold text-[#737373] hover:text-white rounded-md hover:bg-[#141414] transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || success}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-950/30 hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Provisioning...
                </>
              ) : success ? (
                'Created!'
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Create Organization
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
