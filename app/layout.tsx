import type {Metadata} from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css'; // Global styles
import { ToastProvider } from '@/components/Toast';
import { ConfirmProvider } from '@/components/ConfirmDialog';

import Navbar from '@/components/Navbar';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'نيون فين | نظام إدارة القروض ومحافظ الاستثمار للوساطة المالية',
  description: 'منصة SaaS متعددة المستأجرين لإدارة القروض، محافظ الاستثمار، ومخازن البطاقات العينية، موجهة لمكاتب وشركات الوساطة المالية في العراق لضمان الشفافية والأمان المطلق.',
  alternates: {
    canonical: 'https://neonfiniq.com',
  },
  openGraph: {
    title: 'نيون فين | نظام إدارة القروض ومحافظ الاستثمار للوساطة المالية',
    description: 'منصة SaaS متعددة المستأجرين لإدارة القروض، محافظ الاستثمار، ومخازن البطاقات العينية، موجهة لمكاتب وشركات الوساطة المالية في العراق.',
    url: 'https://neonfiniq.com',
    siteName: 'نيون فين',
    locale: 'ar_IQ',
    type: 'website',
    images: [
      {
        url: 'https://neonfiniq.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'نيون فين للتقنية المالية',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نيون فين | نظام إدارة القروض ومحافظ الاستثمار للوساطة المالية',
    description: 'منصة SaaS متعددة المستأجرين لإدارة القروض، محافظ الاستثمار، ومخازن البطاقات العينية، موجهة لمكاتب وشركات الوساطة المالية في العراق.',
    images: ['https://neonfiniq.com/og-image.png'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} bg-[#0a0a0a] text-[#ededed] font-sans flex flex-col min-h-screen`} suppressHydrationWarning>
        <Navbar />
        <ToastProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

