'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, Building2, Settings, Database } from 'lucide-react';

export default function AdminSidebarLinks() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'نظرة عامة',
      href: '/super-admin',
      icon: Activity,
      exact: true,
    },
    {
      name: 'إدارة الفروع والحسابات',
      href: '/super-admin/tenants',
      icon: Building2,
      exact: false,
    },
    {
      name: 'جميع المستخدمين',
      href: '/super-admin/users',
      icon: Users,
      exact: false,
    },
    {
      name: 'عمليات قواعد البيانات',
      href: '/super-admin/database',
      icon: Database,
      exact: false,
    },
    {
      name: 'إعدادات النظام',
      href: '/super-admin/settings',
      icon: Settings,
      exact: false,
    },
    {
      name: 'لوحة التاجر العادية',
      href: '/dashboard',
      icon: Activity,
      exact: false,
    }
  ];

  return (
    <nav className="grid gap-1.5 px-4">
      <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#525252] mb-2 mt-1">
        إدارة النظام
      </p>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname.startsWith(item.href);

        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 border ${
              isActive 
                ? 'bg-[#1a1a1a] text-white border-[#262626] shadow-sm' 
                : 'text-[#a3a3a3] hover:text-white border-transparent hover:bg-[#141414]'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-red-500' : 'opacity-80'}`} />
            <span className="flex-1">{item.name}</span>
            {isActive && (
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
