'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'لوحة التحكم' },
    { href: '/dashboard/investments', label: 'محافظ الاستثمار' },
    { href: '/dashboard/loans', label: 'إدارة القروض' },
    { href: '/dashboard/kyc', label: 'طلبات التحقق (KYC)' },
    { href: '/dashboard/reports', label: 'التقارير والإحصائيات' },
    { href: '/dashboard/audit-logs', label: 'سجل المراقبة' },
    { href: '/dashboard/account', label: 'حسابي' },
  ];

  return (
    <div className="flex gap-6 h-full text-sm font-medium text-[#737373]">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center h-full border-b-2 transition-colors hover:text-white ${
              isActive ? 'border-[#10b981] text-white' : 'border-transparent'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
