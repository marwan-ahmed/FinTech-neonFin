import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4 text-[#737373]">
        <div className="flex h-12 w-12 scale-75 transform items-center justify-center rounded-sm bg-[#10b981] rotate-45 mb-4 animate-pulse">
          <div className="h-6 w-6 bg-black rotate-[-45deg]"></div>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-[#10b981]" />
        <p className="text-xs uppercase tracking-widest text-[#737373]">جاري التحميل...</p>
      </div>
    </div>
  );
}
