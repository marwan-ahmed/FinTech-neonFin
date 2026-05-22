'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Landmark,
  CreditCard,
  ShieldCheck,
  BarChart3,
  ScrollText,
  UserCog,
  Receipt,
  Menu,
  X,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/dashboard/investments', label: 'محافظ الاستثمار', icon: Landmark },
  { href: '/dashboard/cards', label: 'مخازن البطاقات 📦', icon: CreditCard },
  { href: '/dashboard/loans', label: 'إدارة القروض', icon: CreditCard },
  { href: '/dashboard/kyc', label: 'طلبات التحقق', icon: ShieldCheck },
  { href: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
  { href: '/dashboard/billing', label: 'الفواتير والاشتراك', icon: Receipt },
  { href: '/dashboard/audit-logs', label: 'سجل المراقبة', icon: ScrollText },
  { href: '/dashboard/account', label: 'حسابي', icon: UserCog },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ─── Desktop Navigation ─── */}
      <div className="hidden lg:flex gap-1 h-full text-sm font-medium text-[#737373]">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 h-full px-3 border-b-2 transition-all duration-200 hover:text-white text-xs ${
                isActive
                  ? 'border-[#10b981] text-white'
                  : 'border-transparent'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#10b981]' : ''} />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* ─── Mobile Hamburger Button ─── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-[#262626] bg-[#1a1a1a] text-white hover:bg-[#262626] transition-colors"
        aria-label="فتح القائمة"
      >
        <Menu size={18} />
      </button>

      {/* ─── Mobile Drawer ─── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="mobile-nav-overlay"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="mobile-nav-panel">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#10b981] rotate-45">
                  <div className="h-3.5 w-3.5 bg-black rotate-[-45deg]"></div>
                </div>
                <span className="text-base font-bold text-white">
                  نيون <span className="text-[#10b981]">فين</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[#737373] hover:text-white transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col p-3 gap-1 stagger-children">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                        : 'text-[#ededed] hover:bg-[#1a1a1a] border border-transparent'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#10b981]' : 'text-[#737373]'} />
                    {link.label}
                    {isActive && (
                      <div className="mr-auto h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="mt-auto p-4 border-t border-[#262626] text-center">
              <p className="text-[10px] text-[#525252] font-mono">neonFin v2.1.0</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
