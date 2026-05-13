'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Database, RefreshCw } from 'lucide-react';

export default function SystemStatus() {
  const [latency, setLatency] = useState<number>(24);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Update local time
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    // Mock subtle fluctuations in database latency
    const pingTimer = setInterval(() => {
      setLatency((prev) => {
        const diff = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + diff;
        return Math.max(12, Math.min(65, next)); // keep bounded
      });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(pingTimer);
    };
  }, []);

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <div className="flex items-center gap-6">
      {/* Time Display */}
      <div className="hidden md:flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-md border border-[#262626] font-mono text-xs text-[#737373]">
        <span className="uppercase tracking-wider font-semibold text-[10px]">Platform Time:</span>
        <span className="text-white">{currentTime || '--:--:--'}</span>
      </div>

      {/* Active DB stats */}
      <div className="hidden lg:flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-md border border-[#262626] font-mono text-xs">
        <Database className="h-3.5 w-3.5 text-[#3b82f6]" />
        <span className="text-[#737373]">DB PING:</span>
        <span className="text-emerald-400 font-bold">{latency}ms</span>
      </div>

      {/* Operational Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          OPERATIONAL
        </div>

        {/* Sync Refresh Button */}
        <button 
          onClick={triggerManualSync}
          className="h-8 w-8 flex items-center justify-center rounded-md bg-[#141414] border border-[#262626] text-[#737373] hover:text-white transition-colors hover:bg-[#262626]"
          title="Sync Metrics"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}
