/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Moon,
  Clock,
  Disc3,
  Check,
  Zap,
  Sliders,
  HardDrive,
  FolderOpen,
  Plus,
  RotateCcw,
  Volume2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AudioEngineSettings, GaplessMode, SleepTimerMode, SleepTimerState } from '../types/audio';
import { formatBytes, formatTime } from '../utils/formatters';

interface AppleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepTimerState: SleepTimerState;
  onSetSleepTimer: (mode: SleepTimerMode, durationMinutes?: number) => void;
  onCancelSleepTimer: () => void;
  settings: AudioEngineSettings;
  onSetGaplessMode: (mode: GaplessMode) => void;
  onToggleBitPerfect: () => void;
  onOpenImport: () => void;
  storageUsage: { usedBytes: number; trackCount: number };
}

export const AppleSettingsModal: React.FC<AppleSettingsModalProps> = ({
  isOpen,
  onClose,
  sleepTimerState,
  onSetSleepTimer,
  onCancelSleepTimer,
  settings,
  onSetGaplessMode,
  onToggleBitPerfect,
  onOpenImport,
  storageUsage,
}) => {
  const [customMinutes, setCustomMinutes] = useState<number>(20);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  if (!isOpen) return null;

  const timerPresets = [
    { label: '15 Minutes', minutes: 15 },
    { label: '30 Minutes', minutes: 30 },
    { label: '45 Minutes', minutes: 45 },
    { label: '1 Hour', minutes: 60 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      
      {/* Background overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Lucid Glass Modal */}
      <div className="relative w-full max-w-lg glass-panel bg-black/85 border border-white/[0.18] rounded-t-[36px] sm:rounded-[36px] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10 max-h-[90vh]">
        {/* Specular gloss top reflection */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-[36px]" />

        {/* Grab handle for mobile */}
        <div className="w-10 h-1 bg-white/25 rounded-full mx-auto mt-2.5 sm:hidden relative z-10" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1] bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Settings</h3>
              <p className="text-[11px] font-mono text-[#8e8e93]">Audio Engine & Playback</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto no-scrollbar relative z-10">
          
          {/* ========================================================= */}
          {/* 1. HERO FEATURE: SLEEP TIMER                              */}
          {/* ========================================================= */}
          <div className="glass-card rounded-3xl p-5 border border-white/[0.14] space-y-4 relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Sleep Timer</span>
                    {sleepTimerState.active && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#8e8e93]">
                    Gently stops playback after time expires or when song ends
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIVE TIMER STATUS BANNER */}
            {sleepTimerState.active && (
              <div className="p-4 rounded-2xl bg-white/[0.05] border border-violet-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span className="text-xs font-semibold text-white">
                      {sleepTimerState.mode === 'track_end'
                        ? 'Stops when current track finishes'
                        : 'Stopping playback in:'}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-violet-300 tabular-nums">
                    {formatTime(sleepTimerState.remainingSeconds)}
                  </span>
                </div>

                {/* Progress hairline for duration timers */}
                {sleepTimerState.mode === 'duration' && sleepTimerState.totalDurationSeconds > 0 && (
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-[#fa2d48] transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            (sleepTimerState.remainingSeconds / sleepTimerState.totalDurationSeconds) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  {sleepTimerState.mode === 'duration' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSetSleepTimer('duration', Math.ceil(sleepTimerState.remainingSeconds / 60) + 5)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white/80 hover:text-white rounded-lg bg-white/10 hover:bg-white/15 transition-all"
                      >
                        +5m
                      </button>
                      <button
                        onClick={() => onSetSleepTimer('duration', Math.ceil(sleepTimerState.remainingSeconds / 60) + 15)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white/80 hover:text-white rounded-lg bg-white/10 hover:bg-white/15 transition-all"
                      >
                        +15m
                      </button>
                    </div>
                  )}

                  <button
                    onClick={onCancelSleepTimer}
                    className="ml-auto px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-all active:scale-95"
                  >
                    Cancel Timer
                  </button>
                </div>
              </div>
            )}

            {/* PRESET BUTTONS */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93] block">
                Choose Duration
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timerPresets.map((preset) => {
                  const isSelected =
                    sleepTimerState.active &&
                    sleepTimerState.mode === 'duration' &&
                    Math.abs(sleepTimerState.totalDurationSeconds - preset.minutes * 60) < 5;

                  return (
                    <button
                      key={preset.minutes}
                      onClick={() => onSetSleepTimer('duration', preset.minutes)}
                      className={`p-2.5 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center transition-all border ${
                        isSelected
                          ? 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-600/30'
                          : 'bg-white/[0.04] text-white/90 hover:bg-white/[0.08] hover:text-white border-white/[0.08]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 mb-1 opacity-70" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "WHEN CURRENT TRACK FINISHES" OPTION */}
            <div
              onClick={() => onSetSleepTimer('track_end')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                sleepTimerState.active && sleepTimerState.mode === 'track_end'
                  ? 'bg-violet-600/20 border-violet-400 text-white shadow-md shadow-violet-600/15'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-white/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-violet-400 shrink-0">
                  <Disc3 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white tracking-tight">When Current Track Finishes</h5>
                  <p className="text-[11px] text-[#8e8e93]">
                    Stops playback immediately after the current song completes
                  </p>
                </div>
              </div>

              {sleepTimerState.active && sleepTimerState.mode === 'track_end' ? (
                <div className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <span className="text-[10px] font-mono text-[#8e8e93] px-2 py-1 rounded-md bg-white/5 border border-white/5 shrink-0">
                  Select
                </span>
              )}
            </div>

            {/* CUSTOM DURATION TOGGLE */}
            <div className="pt-1">
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 transition-colors"
                >
                  Set custom timer duration...
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8e8e93] font-medium">Custom Duration:</span>
                    <span className="text-white font-mono font-bold text-sm text-violet-300">
                      {customMinutes} Minutes
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="120"
                    step="1"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-white/20 accent-violet-500 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className="px-3 py-1.5 text-xs text-[#8e8e93] hover:text-white transition-colors"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => {
                        onSetSleepTimer('duration', customMinutes);
                        setShowCustomInput(false);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all active:scale-95"
                    >
                      Start {customMinutes}m Timer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. AUDIO ENGINE & PLAYBACK SETTINGS                       */}
          {/* ========================================================= */}
          <div className="glass-card rounded-3xl p-5 border border-white/[0.12] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#fa2d48]/15 border border-[#fa2d48]/30 text-[#fa2d48] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Audio Engine Output</h4>
                <p className="text-xs text-[#8e8e93]">Gapless transitions & bit-perfect hardware stream</p>
              </div>
            </div>

            {/* Bit-Perfect Direct Bypass Switch */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-xs font-semibold text-white block">Bit-Perfect DAC Direct Mode</span>
                <p className="text-[11px] text-[#8e8e93] leading-relaxed">
                  Bypasses software DSP and equalizer to output original lossless PCM to external DAC.
                </p>
              </div>

              <button
                onClick={onToggleBitPerfect}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                  settings.isBitPerfect ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    settings.isBitPerfect ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Gapless Playback Engine Mode */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93] block">
                Gapless Playback Engine
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pure' as GaplessMode, label: 'Pure Gapless', sub: 'Sample-Accurate' },
                  { id: 'micro' as GaplessMode, label: 'Micro-Fade', sub: '250ms Anti-Click' },
                  { id: 'crossfade' as GaplessMode, label: 'Crossfade', sub: '2.0s Studio Mix' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => onSetGaplessMode(mode.id)}
                    className={`p-2.5 rounded-2xl text-center border transition-all ${
                      settings.gaplessMode === mode.id
                        ? 'bg-[#fa2d48] text-white border-[#fa2d48] shadow-md shadow-[#fa2d48]/25'
                        : 'bg-white/[0.03] text-white/80 hover:bg-white/[0.06] border-white/[0.06]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{mode.label}</span>
                    <span className="text-[9px] font-mono opacity-80 block mt-0.5">{mode.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. DEVICE & OFFLINE STORAGE                               */}
          {/* ========================================================= */}
          <div className="glass-card rounded-3xl p-5 border border-white/[0.12] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Device Storage & Cache</h4>
                  <p className="text-xs text-[#8e8e93]">
                    {formatBytes(storageUsage.usedBytes)} used · {storageUsage.trackCount} offline songs
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenImport();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all active:scale-95 border border-white/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Music</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.1] bg-white/[0.02] flex items-center justify-between text-xs text-[#8e8e93] font-mono relative z-10">
          <span>Apple Studio Engine v2.4</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#fa2d48] hover:bg-[#fa2d48]/90 text-white font-sans text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#fa2d48]/25 active:scale-95"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
