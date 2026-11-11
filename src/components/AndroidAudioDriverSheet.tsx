/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Zap, Volume2, ShieldCheck, Sliders, CheckCircle2, HardDrive, Smartphone } from 'lucide-react';
import { AudioEngineSettings } from '../types/audio';
import { formatSampleRate } from '../utils/formatters';

interface AndroidAudioDriverSheetProps {
  settings: AudioEngineSettings;
  outputSampleRate: number;
  onToggleBitPerfect: () => void;
  onSetGaplessMode: (mode: 'pure' | 'micro' | 'crossfade') => void;
  onToggleWakeLock: () => void;
}

export const AndroidAudioDriverSheet: React.FC<AndroidAudioDriverSheetProps> = ({
  settings,
  outputSampleRate,
  onToggleBitPerfect,
  onSetGaplessMode,
  onToggleWakeLock,
}) => {
  const [outputDriver, setOutputDriver] = useState<'aaudio' | 'opensles' | 'direct_dac'>('direct_dac');
  const [resamplingFilter, setResamplingFilter] = useState<'sinc' | 'soxr' | 'linear'>('sinc');

  return (
    <div className="w-full flex-1 p-4 space-y-4 pb-28 text-slate-200 select-none overflow-y-auto">
      
      {/* Driver Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0d1017] border border-amber-400/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Android Audio Output Engine</h3>
              <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Hardware DAC: {formatSampleRate(outputSampleRate)} · 24-bit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bit-Perfect Direct Mode Toggle */}
      <div className="p-4 rounded-2xl bg-[#12141a] border border-white/[0.06] flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-slate-100">Bit-Perfect Direct Bypass</h4>
          </div>
          <p className="text-xs text-slate-400">
            Bypasses Android system audio mixer & DSP for uncompressed stream to DAC
          </p>
        </div>

        <button
          onClick={onToggleBitPerfect}
          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
            settings.isBitPerfect ? 'bg-amber-400' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transition-transform duration-200 ${
              settings.isBitPerfect ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Output Audio Driver Selector */}
      <div className="p-4 rounded-2xl bg-[#12141a] border border-white/[0.06] space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Android Audio Driver Architecture
        </h4>

        <div className="space-y-2">
          <button
            onClick={() => setOutputDriver('direct_dac')}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              outputDriver === 'direct_dac'
                ? 'bg-amber-400/10 border-amber-400/50 text-slate-100'
                : 'bg-[#161922] border-white/[0.04] text-slate-300 hover:bg-[#1a1e2a]'
            }`}
          >
            <div>
              <span className="text-xs font-bold block">Direct Hi-Res DAC (Poweramp / UAPP style)</span>
              <span className="text-[11px] text-slate-400 font-mono">Bypasses Android 48kHz resampler · 24-bit/192kHz direct</span>
            </div>
            {outputDriver === 'direct_dac' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
          </button>

          <button
            onClick={() => setOutputDriver('aaudio')}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              outputDriver === 'aaudio'
                ? 'bg-amber-400/10 border-amber-400/50 text-slate-100'
                : 'bg-[#161922] border-white/[0.04] text-slate-300 hover:bg-[#1a1e2a]'
            }`}
          >
            <div>
              <span className="text-xs font-bold block">AAudio (High-Performance Low-Latency)</span>
              <span className="text-[11px] text-slate-400 font-mono">Native Android C API · Minimal buffer delay</span>
            </div>
            {outputDriver === 'aaudio' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
          </button>

          <button
            onClick={() => setOutputDriver('opensles')}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              outputDriver === 'opensles'
                ? 'bg-amber-400/10 border-amber-400/50 text-slate-100'
                : 'bg-[#161922] border-white/[0.04] text-slate-300 hover:bg-[#1a1e2a]'
            }`}
          >
            <div>
              <span className="text-xs font-bold block">OpenSL ES</span>
              <span className="text-[11px] text-slate-400 font-mono">Legacy Android Audio Driver for maximum hardware compatibility</span>
            </div>
            {outputDriver === 'opensles' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Gapless Playback Engine Configuration */}
      <div className="p-4 rounded-2xl bg-[#12141a] border border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Gapless Audio Buffering
          </h4>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            Sample-Accurate Clock
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSetGaplessMode('pure')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              settings.gaplessMode === 'pure'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-[#161922] border-white/[0.04] text-slate-300 hover:bg-[#1a1e2a]'
            }`}
          >
            <span className="text-xs block">Pure (0ms)</span>
            <span className="text-[10px] opacity-80 font-mono">Bit-Perfect</span>
          </button>

          <button
            onClick={() => onSetGaplessMode('micro')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              settings.gaplessMode === 'micro'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-[#161922] border-white/[0.04] text-slate-300 hover:bg-[#1a1e2a]'
            }`}
          >
            <span className="text-xs block">Micro-Fade</span>
            <span className="text-[10px] opacity-80 font-mono">Anti-Click 35ms</span>
          </button>

          <button
            onClick={() => onSetGaplessMode('crossfade')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              settings.gaplessMode === 'crossfade'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-[#161922] border-white/[0.04] text-slate-300 hover:bg-[#1a1e2a]'
            }`}
          >
            <span className="text-xs block">Crossfade</span>
            <span className="text-[10px] opacity-80 font-mono">Smooth 2.0s</span>
          </button>
        </div>
      </div>

      {/* Screen Wake Lock */}
      <div className="p-4 rounded-2xl bg-[#12141a] border border-white/[0.06] flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-slate-100">Keep Screen Awake</h4>
          </div>
          <p className="text-xs text-slate-400">
            Prevents Android sleep timer when docked or playing high-resolution audio
          </p>
        </div>

        <button
          onClick={onToggleWakeLock}
          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
            settings.screenWakeLock ? 'bg-amber-400' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transition-transform duration-200 ${
              settings.screenWakeLock ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

    </div>
  );
};
