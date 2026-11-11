/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Wifi, BatteryMedium, Activity } from 'lucide-react';
import { formatSampleRate } from '../utils/formatters';

interface AndroidStatusBarProps {
  isPlaying: boolean;
  sampleRate: number;
  isHiRes: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  isPlaying,
  sampleRate,
  isHiRes,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hrs = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#000000] text-slate-300 px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-sans font-medium select-none border-b border-white/[0.04] shrink-0 z-40">
      
      {/* Left: Clock & Audio status */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-100 tracking-tight text-xs font-mono">
          {timeStr}
        </span>
        {isPlaying && (
          <div className="flex items-center gap-1 text-amber-400 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <Activity className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Center: Punch-hole camera simulator dot */}
      <div className="w-3.5 h-3.5 rounded-full bg-[#0d0f14] border border-slate-800/80 shadow-inner hidden xs:block" />

      {/* Right: Hi-Res DAC, Wi-Fi, Signal, Battery */}
      <div className="flex items-center gap-2.5 font-mono text-[10px]">
        {/* Android Hi-Res DAC Hardware Indicator */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#13161f] border border-amber-500/20 text-amber-400">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="font-bold tracking-tight">HI-RES</span>
          <span className="text-slate-400">{formatSampleRate(sampleRate)}</span>
        </div>

        {/* Wi-Fi & Signal */}
        <div className="flex items-center gap-1 text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-slate-200" />
          <span className="text-[10px] font-bold text-slate-200 font-sans">5G</span>
        </div>

        {/* Battery */}
        <div className="flex items-center gap-1 text-slate-200">
          <span className="text-[10px]">98%</span>
          <div className="w-4 h-2.5 border border-slate-400 rounded-xs p-0.5 flex items-center">
            <div className="w-2.5 h-full bg-slate-200 rounded-2xs" />
          </div>
        </div>
      </div>

    </div>
  );
};
