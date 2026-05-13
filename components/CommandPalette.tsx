'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LayoutDashboard, CreditCard, BarChart3, Landmark, ShieldCheck, ScrollText, UserCog, X, Command } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  // فتح/إغلاق بـ Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!isOpen) return null;

  return <CommandPaletteModal onClose={() => setIsOpen(false)} />;
}

function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // تركيز تلقائي عند الفتح
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const navigate = useCallback((path: string) => {
    onClose();
    router.push(path);
  }, [router, onClose]);

  // قائمة الأوامر المتاحة
  const commands: CommandItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', description: 'الرئيسية والمؤشرات', icon: <LayoutDashboard size={16} />, action: () => navigate('/dashboard'), keywords: ['لوحة', 'رئيسية', 'dashboard', 'home'] },
    { id: 'loans', label: 'إدارة القروض', description: 'عرض وإدارة التسهيلات', icon: <CreditCard size={16} />, action: () => navigate('/dashboard/loans'), keywords: ['قروض', 'تسهيلات', 'loans', 'credit'] },
    { id: 'investments', label: 'محافظ الاستثمار', description: 'المستثمرين ورأس المال', icon: <Landmark size={16} />, action: () => navigate('/dashboard/investments'), keywords: ['استثمار', 'مستثمر', 'محفظة', 'investments'] },
    { id: 'reports', label: 'التقارير والإحصائيات', description: 'تحليل الأداء المالي', icon: <BarChart3 size={16} />, action: () => navigate('/dashboard/reports'), keywords: ['تقرير', 'إحصائيات', 'reports', 'analytics'] },
    { id: 'kyc', label: 'طلبات التحقق', description: 'إدارة KYC', icon: <ShieldCheck size={16} />, action: () => navigate('/dashboard/kyc'), keywords: ['تحقق', 'kyc', 'verification'] },
    { id: 'audit', label: 'سجل المراقبة', description: 'تتبع العمليات', icon: <ScrollText size={16} />, action: () => navigate('/dashboard/audit-logs'), keywords: ['سجل', 'مراقبة', 'audit', 'logs'] },
    { id: 'account', label: 'حسابي', description: 'إعدادات الحساب', icon: <UserCog size={16} />, action: () => navigate('/dashboard/account'), keywords: ['حساب', 'إعدادات', 'account', 'settings'] },
  ];

  // تصفية البحث
  const filtered = query.trim()
    ? commands.filter((cmd) =>
        cmd.label.includes(query) ||
        cmd.description?.includes(query) ||
        cmd.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : commands;

  // التنقل بالأسهم
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    }
  };

  return (
    <>
      {/* خلفية */}
      <div
        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* نافذة الأوامر */}
      <div className="fixed inset-0 z-[301] flex items-start justify-center pt-[15vh] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-[#262626] bg-[#141414] shadow-[0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-scale-in">
          {/* حقل البحث */}
          <div className="flex items-center gap-3 border-b border-[#262626] px-4 py-3">
            <Search size={18} className="text-[#737373] flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-[#ededed] outline-none placeholder:text-[#525252]"
              placeholder="ابحث أو اذهب إلى..."
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[#262626] bg-[#0f0f0f] px-1.5 py-0.5 text-[10px] font-mono text-[#525252]">
              ESC
            </kbd>
          </div>

          {/* قائمة النتائج */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#525252]">
                لا توجد نتائج مطابقة
              </div>
            ) : (
              filtered.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 w-full text-right rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    idx === selectedIndex
                      ? 'bg-[#10b981]/10 text-[#10b981]'
                      : 'text-[#ededed] hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span className={`flex-shrink-0 ${idx === selectedIndex ? 'text-[#10b981]' : 'text-[#525252]'}`}>
                    {cmd.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold">{cmd.label}</span>
                    {cmd.description && (
                      <span className="text-xs text-[#525252] mr-2">— {cmd.description}</span>
                    )}
                  </div>
                  {idx === selectedIndex && (
                    <kbd className="text-[10px] font-mono text-[#525252] bg-[#0f0f0f] border border-[#262626] px-1.5 py-0.5 rounded">
                      ↵
                    </kbd>
                  )}
                </button>
              ))
            )}
          </div>

          {/* تذييل */}
          <div className="flex items-center justify-between border-t border-[#262626] px-4 py-2 text-[10px] text-[#525252]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><kbd className="bg-[#0f0f0f] border border-[#262626] rounded px-1">↑↓</kbd> تنقل</span>
              <span className="flex items-center gap-1"><kbd className="bg-[#0f0f0f] border border-[#262626] rounded px-1">↵</kbd> تنفيذ</span>
            </div>
            <span className="flex items-center gap-1"><Command size={10} />+K لفتح/إغلاق</span>
          </div>
        </div>
      </div>
    </>
  );
}
