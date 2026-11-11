/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Plus, Download, HardDrive } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type LibraryViewTab = 'tracks' | 'albums' | 'artists' | 'hires';

interface HeaderProps {
  activeTab: LibraryViewTab;
  onTabChange: (tab: LibraryViewTab) => void;
  onOpenImport: () => void;
  onOpenEQ: () => void;
  outputSampleRate: number;
  totalTracks: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenImport,
  onOpenEQ,
  outputSampleRate,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-30 bg-[#0b0e14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <svg className="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Aura <span className="text-amber-400 font-medium text-xs md:text-sm tracking-wider uppercase ml-1">Hi-Fi</span>
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="flex items-center gap-1 md:gap-6 overflow-x-auto no-scrollbar py-1 text-xs md:text-sm font-medium">
          <button
            onClick={() => onTabChange('tracks')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'tracks'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tracks
          </button>
          <button
            onClick={() => onTabChange('albums')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'albums'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Albums
          </button>
          <button
            onClick={() => onTabChange('artists')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'artists'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Artists
          </button>
          <button
            onClick={() => onTabChange('hires')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'hires'
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hi-Res Master
          </button>
        </nav>

        {/* Zone 3: Hardware output DAC info & Primary Action */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* DAC Hardware Sample Rate indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131722] border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DAC: {(outputSampleRate / 1000).toFixed(1)} kHz · 24b</span>
          </div>

          {/* Equalizer trigger */}
          <button
            onClick={onOpenEQ}
            title="10-Band Equalizer & DSP"
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-[#131722] border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* PWA Install Button on Android / Chrome */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Primary Action Button: Add local device audio */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-400/20 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Music</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

      </div>
    </header>
  );
};
