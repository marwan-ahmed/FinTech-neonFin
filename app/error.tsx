'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] gap-4">
      <div className="text-center p-8 bg-[#141414] border border-[#262626] rounded-lg max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-3">عذراً، حدث خطأ ما!</h2>
        <p className="text-sm text-[#737373] mb-8">
          {error.message || 'حدث خطأ في النظام، يرجى المحاولة مرة أخرى لاحقاً.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-[#10b981] text-black px-4 py-2 rounded font-bold hover:bg-[#34d399] transition-colors"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/dashboard"
            className="border border-[#262626] bg-[#0f0f0f] text-white px-4 py-2 rounded font-bold hover:bg-[#1a1a1a] transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
