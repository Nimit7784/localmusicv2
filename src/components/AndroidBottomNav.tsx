/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Music2, Folder, Sliders, Cpu, Disc3 } from 'lucide-react';

export type AndroidNavTab = 'library' | 'folders' | 'nowplaying' | 'equalizer' | 'output';

interface AndroidBottomNavProps {
  activeTab: AndroidNavTab;
  onTabChange: (tab: AndroidNavTab) => void;
  isPlaying: boolean;
  hasTrack: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  isPlaying,
  hasTrack,
}) => {
  const tabs = [
    { id: 'library', label: 'Library', icon: Music2 },
    { id: 'folders', label: 'Folders', icon: Folder },
    { id: 'nowplaying', label: 'Player', icon: Disc3, highlight: hasTrack },
    { id: 'equalizer', label: 'DSP / EQ', icon: Sliders },
    { id: 'output', label: 'Hi-Res DAC', icon: Cpu },
  ] as const;

  return (
    <div className="w-full bg-[#000000] border-t border-white/[0.08] px-2 pt-1 pb-2 flex flex-col shrink-0 select-none z-30">
      
      {/* 5 Bottom destinations */}
      <div className="grid grid-cols-5 items-center justify-items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as AndroidNavTab)}
              className="flex flex-col items-center justify-center py-1 w-full min-h-[48px] active:scale-95 transition-transform"
            >
              {/* Material 3 active pill background */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    tab.id === 'nowplaying' && isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                  }`}
                />
              </div>

              {/* Tab Label */}
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android System Gesture Bar (Pill) */}
      <div className="w-full flex justify-center pt-1.5 pb-0.5">
        <div className="w-32 h-1 bg-white/20 rounded-full" />
      </div>

    </div>
  );
};
