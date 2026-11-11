/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayCircle, FolderHeart, Search } from 'lucide-react';

export type AppleTab = 'listen_now' | 'library' | 'search';

interface AppleBottomTabBarProps {
  activeTab: AppleTab;
  onTabChange: (tab: AppleTab) => void;
}

export const AppleBottomTabBar: React.FC<AppleBottomTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'listen_now', label: 'Listen Now', icon: PlayCircle },
    { id: 'library', label: 'Library', icon: FolderHeart },
    { id: 'search', label: 'Search', icon: Search },
  ] as const;

  return (
    <div className="w-full glass-panel border-t border-white/[0.16] px-3 pt-1.5 pb-2 flex flex-col shrink-0 select-none z-30 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-3 items-center justify-items-center max-w-md mx-auto w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as AppleTab)}
              className="flex flex-col items-center justify-center py-1 w-full min-h-[48px] active:scale-95 transition-transform group"
            >
              <div className={`p-1 rounded-full transition-all duration-200 ${isActive ? 'bg-[#fa2d48]/15 shadow-[0_0_16px_rgba(250,45,72,0.35)]' : ''}`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#fa2d48] drop-shadow-[0_0_8px_rgba(250,45,72,0.6)]' : 'text-[#98989d] group-hover:text-white'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-[#fa2d48] font-bold' : 'text-[#8e8e93] group-hover:text-white/80'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lucid Home Indicator Bar */}
      <div className="w-full flex justify-center pt-1 pb-0.5">
        <div className="w-32 h-1 bg-white/30 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
      </div>
    </div>
  );
};
