import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex w-full h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[#737373]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
        <p className="text-sm uppercase tracking-widest">جاري تحميل البيانات...</p>
      </div>
    </div>
  );
}
