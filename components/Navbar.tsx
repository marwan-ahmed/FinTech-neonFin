'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Menu, X, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on pathname change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Determine if we should hide the navbar
  // Hide in dashboard, super-admin, and login pages
  const isHidden = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/super-admin') || 
    pathname.startsWith('/login');

  if (isHidden) {
    return null;
  }

  const links = [
    { name: 'الرئيسية', href: '/' },
    { name: 'الأسعار', href: '/pricing' },
    { name: 'حول المنصة', href: '/about' },
    { name: 'اتصل بنا', href: '/contact' },
  ];

  return (
    <nav className="global-navbar sticky top-0 z-50 backdrop-blur-md bg-[#050505]/70 border-b border-[#1f1f1f] transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105">
            <Zap size={20} className="text-black" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight group-hover:text-[#10b981] transition-colors">نيون فين</span>
            <span className="text-[10px] text-[#737373] block font-mono">neonFin v1.0</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#10b981] ${
                  isActive ? 'text-[#10b981] font-semibold' : 'text-[#a3a3a3]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Button & Hamburger */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-black font-bold py-2 px-5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 text-xs md:text-sm"
          >
            <span>لوحة التحكم</span>
            <ArrowLeft size={14} className="rtl:rotate-0" />
          </Link>

          {/* Hamburger Icon */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#a3a3a3] hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-[#1f1f1f] bg-[#050505]/95 backdrop-blur-lg animate-fade-in">
          <div className="px-6 py-6 flex flex-col gap-4">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium py-2 transition-colors hover:text-[#10b981] ${
                    isActive ? 'text-[#10b981] font-semibold border-r-2 border-[#10b981] pr-3' : 'text-[#a3a3a3]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-black font-bold py-3 rounded-xl transition-all text-sm w-full"
            >
              <span>لوحة التحكم</span>
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
