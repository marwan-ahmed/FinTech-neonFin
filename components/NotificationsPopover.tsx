"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, AlertTriangle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotificationsPopover() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("neonfin_dismissed_notifications");
      try {
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const saveDismissed = (ids: string[]) => {
    setDismissedIds(ids);
    if (typeof window !== "undefined") {
      localStorage.setItem("neonfin_dismissed_notifications", JSON.stringify(ids));
    }
  };

  useEffect(() => {
    let active = true;

    const fetchLateInstallments = async () => {
      try {
        const res = await fetch("/api/loans");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        const lateList: any[] = [];
        data.forEach((loan: any) => {
          if (loan.schedule && Array.isArray(loan.schedule)) {
            loan.schedule.forEach((installment: any) => {
              const dueDate = new Date(installment.dueDate);
              const now = new Date();
              // If it's pending, due in the past, and we haven't paid it fully
              const paidAmount = parseFloat(installment.paidAmount || '0');
              const amountDue = parseFloat(installment.amount || '0');
              const isFullyPaid = installment.status === 'paid' || paidAmount >= amountDue;
              
              if (!isFullyPaid && dueDate < now) {
                const remainingAmount = Math.max(0, amountDue - paidAmount);
                lateList.push({
                  id: `${loan.id}-${installment.installmentNumber}`,
                  loanId: loan.id,
                  borrowerName: loan.borrowerName,
                  installmentNumber: installment.installmentNumber,
                  dueDate: installment.dueDate,
                  remainingAmount,
                  isPartial: paidAmount > 0
                });
              }
            });
          }
        });
        
        // Sort by due date (oldest first)
        lateList.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        if (active) {
          setNotifications(lateList);
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchLateInstallments();
    // Re-fetch every 1 minute
    const interval = setInterval(fetchLateInstallments, 60000);
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeNotifications = notifications.filter(n => !dismissedIds.includes(n.id));
  const unreadCount = activeNotifications.length;

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    saveDismissed([...dismissedIds, id]);
  };

  const dismissAll = () => {
    const newDismissed = [...dismissedIds, ...activeNotifications.map(n => n.id)];
    saveDismissed(newDismissed);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#404040] bg-[#262626] text-[#ededed] hover:bg-[#404040] transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white ring-2 ring-[#0f0f0f]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-12 z-50 w-80 rounded-lg border border-[#262626] bg-[#141414] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#262626] bg-[#1a1a1a] px-4 py-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              الإشعارات
              {unreadCount > 0 && (
                <span className="bg-[#ef4444]/20 text-[#ef4444] text-xs px-2 py-0.5 rounded-full">
                  {unreadCount} تأخير
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={dismissAll}
                className="text-xs text-[#737373] hover:text-white flex items-center gap-1 transition-colors"
              >
                <Check size={14} />
                تحديد كالكل مقروء
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#737373] text-sm">
                جاري التحديث...
              </div>
            ) : activeNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                <Check className="h-8 w-8 text-[#10b981]/50" />
                <span className="text-[#737373] text-sm">لا توجد دفعات متأخرة حالياً</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {activeNotifications.map((note) => (
                  <Link 
                    href={`/dashboard/loans/${note.loanId}`} 
                    key={note.id}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col gap-1 border-b border-[#262626] p-4 hover:bg-[#1a1a1a] transition-colors last:border-0 relative group"
                  >
                    <div className="flex justify-between items-start pr-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-[#ef4444]" />
                        <span className="text-sm font-bold text-[#ededed]">
                          تأخر سداد قسط #{note.installmentNumber}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#ef4444]" dir="ltr">
                        {note.remainingAmount.toLocaleString()} IQD
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#737373] mt-1">
                      اسم المقترض: <strong className="text-[#ededed]">{note.borrowerName}</strong> 
                      {note.isPartial && <span className="mr-1 text-[#3b82f6]">(مسدد جزئياً)</span>}
                    </p>
                    <p className="text-[10px] text-[#737373] mt-1">
                      تاريخ الاستحقاق: {new Date(note.dueDate).toLocaleDateString('ar-IQ')}
                    </p>

                    <button 
                      onClick={(e) => dismissNotification(note.id, e)}
                      className="absolute top-4 right-4 text-[#737373] opacity-0 group-hover:opacity-100 hover:text-[#ef4444] transition-all bg-[#141414]/80 rounded"
                      title="حذف الإشعار"
                    >
                      <Trash2 size={14} />
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
