/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, RotateCcw, Zap, Sliders } from 'lucide-react';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../audio/AudioEngine';
import { AudioEngineSettings, EQPreset } from '../types/audio';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioEngineSettings;
  onSetBandGain: (bandIndex: number, gainDb: number) => void;
  onApplyPreset: (preset: EQPreset) => void;
  onSetPreamp: (gainDb: number) => void;
  onToggleBitPerfect: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSetBandGain,
  onApplyPreset,
  onSetPreamp,
  onToggleBitPerfect,
}) => {
  if (!isOpen) return null;

  const bandLabels = ['31Hz', '62Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl glass-panel bg-black/85 border border-white/[0.18] rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10 max-h-[92vh]">
        {/* Specular glass reflection */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1] bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Equalizer</span>
                {settings.isBitPerfect && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    BIT-PERFECT BYPASS
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#8e8e93]">
                10-Band Studio IIR Biquad Filters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto no-scrollbar relative z-10">
          
          {/* Top Controls: Preset Selector & Bit-Perfect Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.04] p-3.5 rounded-2xl border border-white/[0.08]">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93] block mb-1.5">
                Acoustic Profile
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EQ_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                      settings.currentPresetId === preset.id
                        ? 'bg-[#fa2d48] text-white font-semibold shadow-md shadow-[#fa2d48]/30'
                        : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Bypass Button */}
            <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
              <button
                onClick={onToggleBitPerfect}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  settings.isBitPerfect
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Bypass Direct</span>
              </button>

              <button
                onClick={() => onApplyPreset(EQ_PRESETS[0])}
                title="Reset to Flat"
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 10 Faders Grid in Frosted Well */}
          <div className="bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-white/[0.08]">
            
            {/* Zero dB guide line */}
            <div className="text-[10px] font-mono text-[#8e8e93] mb-2 flex justify-between px-1">
              <span>+12 dB</span>
              <span className="text-white/60 font-semibold">0 dB (Reference)</span>
              <span>-12 dB</span>
            </div>

            <div className="grid grid-cols-10 gap-1 sm:gap-2 items-center justify-items-center h-44 py-2">
              {bandLabels.map((label, idx) => {
                const gain = settings.customBandGains[idx] || 0;
                return (
                  <div key={label} className="flex flex-col items-center h-full justify-between">
                    {/* Gain display */}
                    <span className="text-[10px] font-mono tabular-nums text-[#fa2d48] font-medium">
                      {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                    </span>

                    {/* Vertical range input */}
                    <div className="h-28 flex items-center justify-center my-1">
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.5"
                        disabled={settings.isBitPerfect}
                        value={gain}
                        onChange={(e) => onSetBandGain(idx, parseFloat(e.target.value))}
                        className="vertical-fader opacity-90 hover:opacity-100 disabled:opacity-30 cursor-pointer accent-[#fa2d48]"
                      />
                    </div>

                    {/* Frequency label */}
                    <span className="text-[9px] sm:text-[10px] font-mono text-[#8e8e93] whitespace-nowrap mt-1">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pre-amp Gain slider */}
          <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.08] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-white">Pre-Amp Level</span>
              <p className="text-[11px] text-[#8e8e93] mt-0.5">
                Headroom gain before biquad filtering
              </p>
            </div>

            <div className="flex items-center gap-3 w-40 sm:w-48">
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                disabled={settings.isBitPerfect}
                value={settings.preampGain}
                onChange={(e) => onSetPreamp(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 accent-[#fa2d48] disabled:opacity-30 rounded-lg"
              />
              <span className="text-xs font-mono text-[#fa2d48] tabular-nums w-12 text-right font-medium">
                {settings.preampGain > 0 ? `+${settings.preampGain}dB` : `${settings.preampGain}dB`}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.1] bg-white/[0.02] flex items-center justify-between text-xs text-[#8e8e93] font-mono relative z-10">
          <span>Engine: 64-bit Linear Phase</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all font-sans text-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
