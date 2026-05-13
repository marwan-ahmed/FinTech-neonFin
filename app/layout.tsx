import type {Metadata} from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css'; // Global styles
import { ToastProvider } from '@/components/Toast';
import { ConfirmProvider } from '@/components/ConfirmDialog';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'نيون فين - وساطة رقمية للتقنية المالية',
  description: 'منصة وساطة مالية تربط المستثمرين والعملاء في العراق بسلاسة وأمان.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} bg-[#0a0a0a] text-[#ededed] font-sans flex flex-col min-h-screen`} suppressHydrationWarning>
        <ToastProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

