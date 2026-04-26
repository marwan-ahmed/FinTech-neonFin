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
  ];

  return (
    <div className="flex gap-6 text-sm font-medium text-[#737373]">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`mt-5 pb-5 transition-colors hover:text-white ${
              isActive ? 'border-b border-[#10b981] text-white' : ''
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
