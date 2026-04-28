'use client';

import { useState } from 'react';
import { X, Save, Loader2, DollarSign, Building2, UserCircle } from 'lucide-react';

interface AddInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInvestorModal({ isOpen, onClose, onSuccess }: AddInvestorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capital: '',
    type: 'retail'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capital: parseFloat(formData.capital) || 0
        })
      });

      if (!res.ok) {
        throw new Error('فشل إضافة المستثمر');
      }

      setFormData({ name: '', capital: '', type: 'retail' });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#262626] rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-[#262626] bg-[#0f0f0f]">
          <h2 className="text-xl font-bold text-white">إضافة مستثمر جديد</h2>
          <button 
            onClick={onClose}
            className="text-[#737373] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6 overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded text-sm font-bold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#737373] uppercase tracking-widest font-bold">اسم المستثمر</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded border border-[#262626] bg-[#0f0f0f] py-3 px-4 text-white focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors"
              placeholder="الاسم الكامل أو اسم الشركة"
            />
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs text-[#737373] uppercase tracking-widest font-bold flex justify-between">
                <span>رأس المال المودع</span>
                <span className="text-[#10b981]">دينار عراقي</span>
             </label>
             <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373]">
                  <DollarSign size={16} />
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.capital}
                  onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                  className="w-full rounded border border-[#262626] bg-[#0f0f0f] py-3 pr-10 pl-4 text-white font-mono text-right focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-colors"
                  placeholder="0.00"
                  dir="ltr"
                />
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <label className="text-xs text-[#737373] uppercase tracking-widest font-bold">نوع المستثمر</label>
             <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'retail' })}
                  className={`flex items-center gap-2 justify-center py-3 px-4 rounded border transition-colors ${
                    formData.type === 'retail' 
                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' 
                    : 'bg-[#0f0f0f] border-[#262626] text-[#737373] hover:bg-[#1a1a1a]'
                  }`}
                >
                   <UserCircle size={18} />
                   <span>أفراد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'institutional' })}
                  className={`flex items-center gap-2 justify-center py-3 px-4 rounded border transition-colors ${
                    formData.type === 'institutional' 
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-500' 
                    : 'bg-[#0f0f0f] border-[#262626] text-[#737373] hover:bg-[#1a1a1a]'
                  }`}
                >
                   <Building2 size={18} />
                   <span>مؤسسات</span>
                </button>
             </div>
          </div>

        </form>

        <div className="p-5 border-t border-[#262626] bg-[#0f0f0f] flex gap-3">
           <button
             type="button"
             onClick={onClose}
             className="flex-1 py-2.5 rounded bg-transparent border border-[#262626] text-white hover:bg-[#1a1a1a] transition-colors font-bold"
           >
             إلغاء
           </button>
           <button
             onClick={handleSubmit}
             disabled={loading || !formData.name || !formData.capital}
             className="flex-1 py-2.5 rounded bg-[#10b981] text-black hover:bg-[#34d399] transition-colors font-bold flex justify-center items-center gap-2 disabled:opacity-50"
           >
             {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
             <span>إضافة وحفظ</span>
           </button>
        </div>
      </div>
    </div>
  );
}
