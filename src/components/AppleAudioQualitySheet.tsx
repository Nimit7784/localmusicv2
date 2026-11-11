/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, ShieldCheck, Waves } from 'lucide-react';
import { AudioTrack } from '../types/audio';
import { formatBitrate, formatSampleRate } from '../utils/formatters';

interface AppleAudioQualitySheetProps {
  track: AudioTrack | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppleAudioQualitySheet: React.FC<AppleAudioQualitySheetProps> = ({
  track,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm glass-panel bg-black/80 text-white rounded-t-[32px] sm:rounded-[32px] border border-white/[0.18] shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 z-10 space-y-4">
        {/* Specular gloss top reflection */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Grab handle for mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48]">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {track.isHiRes ? 'Hi-Res Lossless' : 'Lossless Audio'}
              </h3>
              <span className="text-[10px] font-mono text-[#8e8e93] uppercase tracking-wider">
                Apple Studio Engine
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#98989d] leading-relaxed relative z-10">
          Lossless audio compression preserves every single bit of the original studio recording.
          Hardware DAC bypass delivers bit-perfect accuracy with zero gap latency.
        </p>

        {/* Technical Specification Box in Frosted Glass */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] space-y-2.5 text-xs font-mono relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[#8e8e93]">Audio Format</span>
            <span className="text-white font-semibold">{track.format} (ALAC Compatible)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8e8e93]">Bit Depth</span>
            <span className="text-[#fa2d48] font-bold">{track.bitDepth}-Bit Linear PCM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8e8e93]">Sample Rate</span>
            <span className="text-white">{formatSampleRate(track.sampleRate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8e8e93]">Bitrate</span>
            <span className="text-white">{formatBitrate(track.bitrate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8e8e93]">Gapless Engine</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sample-Accurate Clock
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[#8e8e93] leading-normal pt-1 relative z-10">
          {track.sampleRate > 48000
            ? 'Hi-Res Lossless requires an external digital-to-analog converter (DAC) for full resolution output.'
            : 'Lossless audio plays directly through internal speakers, USB-C DAC, or wired headphones.'}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors relative z-10"
        >
          Done
        </button>
      </div>
    </div>
  );
};
