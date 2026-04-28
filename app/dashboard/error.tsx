'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex w-full h-[60vh] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ ما!</h2>
        <p className="text-sm text-[#737373] max-w-md mx-auto mb-6">
          {error.message || 'حدث خطأ غير متوقع أثناء محاولة تحميل البيانات.'}
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#10b981] text-black px-4 py-2 rounded font-bold hover:bg-[#34d399] transition-colors"
        >
          المحاولة مرة أخرى
        </button>
      </div>
    </div>
  );
}
