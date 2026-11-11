/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Cpu, HardDrive, Music, ShieldCheck, Waves } from 'lucide-react';
import { AudioTrack } from '../types/audio';
import { formatBitrate, formatBytes, formatSampleRate, formatTime } from '../utils/formatters';

interface TrackDetailsModalProps {
  track: AudioTrack | null;
  onClose: () => void;
}

export const TrackDetailsModal: React.FC<TrackDetailsModalProps> = ({ track, onClose }) => {
  if (!track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md glass-panel bg-black/85 border border-white/[0.18] rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10">
        {/* Specular glass reflection */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1] bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Audio Stream Inspector</h3>
              <p className="text-[10px] font-mono text-[#8e8e93]">Hardware & Codec Specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono relative z-10">
          
          {/* Track Summary Banner */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1]">
            <img
              src={track.coverUrl}
              alt={track.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white truncate text-sm font-sans">{track.title}</h4>
              <p className="text-[#8e8e93] truncate mt-0.5 font-sans">{track.artist}</p>
            </div>
          </div>

          {/* Hi-Res Verification Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fa2d48]/15 border border-[#fa2d48]/30 text-[#fa2d48]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold text-[11px]">
                {track.isHiRes ? 'Hi-Res Lossless Audio Master' : 'Lossless Audio / PCM'}
              </span>
            </div>
            <span className="font-bold">{track.format}</span>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-white">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[10px] text-[#8e8e93] uppercase block">Bit Depth</span>
              <span className="text-sm font-bold text-[#fa2d48]">{track.bitDepth}-Bit Linear PCM</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[10px] text-[#8e8e93] uppercase block">Sample Rate</span>
              <span className="text-sm font-bold text-white">{formatSampleRate(track.sampleRate)}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[10px] text-[#8e8e93] uppercase block">Bitrate</span>
              <span className="text-sm font-bold text-white">{formatBitrate(track.bitrate)}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[10px] text-[#8e8e93] uppercase block">Channels</span>
              <span className="text-sm font-bold text-white">{track.channels === 2 ? 'Stereo (2.0)' : 'Mono (1.0)'}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[10px] text-[#8e8e93] uppercase block">File Container Size</span>
              <span className="text-sm font-bold text-white">{formatBytes(track.fileSize)}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[10px] text-[#8e8e93] uppercase block">Duration</span>
              <span className="text-sm font-bold text-white">{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Metadata Tags */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5 text-[#8e8e93]">
            <span className="text-[10px] text-white/40 uppercase block mb-1">Embedded Tags</span>
            <div className="flex justify-between">
              <span>Album:</span>
              <span className="text-white truncate ml-2 max-w-[200px]">{track.album}</span>
            </div>
            {track.genre && (
              <div className="flex justify-between">
                <span>Genre:</span>
                <span className="text-white">{track.genre}</span>
              </div>
            )}
            {track.year && (
              <div className="flex justify-between">
                <span>Year:</span>
                <span className="text-white">{track.year}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Source File:</span>
              <span className="text-white truncate ml-2 max-w-[200px]">{track.fileName}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.1] bg-white/[0.02] flex justify-end relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
