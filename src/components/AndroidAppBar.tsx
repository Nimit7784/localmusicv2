/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, FolderPlus, Sliders, HardDrive, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidAppBarProps {
  title: string;
  subtitle?: string;
  onOpenSearch?: () => void;
  onOpenImport: () => void;
  onOpenAudioSettings: () => void;
  onOpenEQ: () => void;
}

export const AndroidAppBar: React.FC<AndroidAppBarProps> = ({
  title,
  subtitle,
  onOpenSearch,
  onOpenImport,
  onOpenAudioSettings,
  onOpenEQ,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <div className="w-full bg-[#000000] border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 select-none">
      
      {/* Title & Android Audio Tag */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/10 shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-100 truncate tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Android Top Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Search */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            title="Search Audio"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Scan / Add Local Device Storage */}
        <button
          onClick={onOpenImport}
          className="w-9 h-9 rounded-full flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 active:scale-95 transition-all"
          title="Scan Device Storage / Add Music"
        >
          <FolderPlus className="w-4 h-4" />
        </button>

        {/* Equalizer */}
        <button
          onClick={onOpenEQ}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-amber-400 hover:bg-white/10 active:scale-95 transition-all"
          title="10-Band Parametric EQ"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* PWA Install on Android */}
        {isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-full hover:bg-amber-400/20 active:scale-95 transition-all"
          >
            <Download className="w-3 h-3" />
            <span className="hidden xs:inline">Install</span>
          </button>
        )}
      </div>

    </div>
  );
};
