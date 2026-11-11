/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Disc, Moon } from 'lucide-react';
import { AudioTrack, SleepTimerState } from '../types/audio';
import { formatSampleRate } from '../utils/formatters';

interface AppleListenNowViewProps {
  tracks: AudioTrack[];
  sleepTimerState?: SleepTimerState;
  onPlayTrack: (track: AudioTrack, index: number) => void;
  onOpenImport: () => void;
  onOpenSettings?: () => void;
}

export const AppleListenNowView: React.FC<AppleListenNowViewProps> = ({
  tracks,
  sleepTimerState,
  onPlayTrack,
  onOpenImport,
  onOpenSettings,
}) => {
  const featuredTrack = tracks[0];

  return (
    <div className="w-full flex-1 flex flex-col p-4 space-y-6 pb-28 select-none overflow-y-auto">
      
      {/* Page Title */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Listen Now</h1>
          <p className="text-xs text-[#8e8e93] mt-0.5">Top picks and lossless music for you</p>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-full glass-pill border transition-all ${
              sleepTimerState?.active
                ? 'border-violet-500/60 text-violet-300 bg-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.3)] animate-pulse'
                : 'border-white/10 text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Settings & Sleep Timer"
          >
            <Moon className="w-4 h-4" />
          </button>
        )}
      </div>

      {tracks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#1c1c1e] border border-white/[0.08] flex items-center justify-center text-[#fa2d48] shadow-2xl">
            <Disc className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Looking for your music?
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              Add FLAC, WAV, ALAC, or MP3 songs and folders from your device to start listening in bit-perfect lossless quality.
            </p>
          </div>
          <button
            onClick={onOpenImport}
            className="px-6 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#fa2d48]/90 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/25 transition-all"
          >
            Add Music from Device
          </button>
        </div>
      ) : (
        <>

      {/* Apple Music Hero Featured Banner */}
      {featuredTrack && (
        <div
          onClick={() => onPlayTrack(featuredTrack, 0)}
          className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-[#2b1016] via-[#1c1722] to-[#121216] border border-white/[0.08] p-5 cursor-pointer shadow-xl group active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-2xl shrink-0 border border-white/[0.1]">
              <img
                src={featuredTrack.coverUrl}
                alt={featuredTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-[#fa2d48] uppercase tracking-widest block font-mono">
                TOP PICK · HI-RES LOSSLESS
              </span>
              <h3 className="text-base font-bold text-white truncate tracking-tight mt-1">
                {featuredTrack.title}
              </h3>
              <p className="text-xs text-[#98989d] truncate mt-0.5">
                {featuredTrack.artist}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fa2d48] text-white rounded-full text-xs font-bold shadow-md shadow-[#fa2d48]/20">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play</span>
                </div>
                <span className="text-[11px] font-mono text-white/50">
                  {featuredTrack.format} · {formatSampleRate(featuredTrack.sampleRate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recently Played / Heavy Rotation Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Heavy Rotation</h2>
          <span className="text-xs text-[#fa2d48] font-medium cursor-pointer">See All</span>
        </div>

        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-1">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track, idx)}
              className="w-32 shrink-0 cursor-pointer group active:scale-95 transition-transform"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1c1c1e] shadow-lg mb-2 border border-white/[0.08]">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-[#fa2d48] flex items-center justify-center text-white shadow-md">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-xs font-semibold text-white truncate">{track.title}</h4>
              <p className="text-[11px] text-[#8e8e93] truncate">{track.artist}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hi-Res Lossless Spotlight */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Hi-Res Lossless Audio</h2>
          <span className="text-xs text-[#fa2d48] font-medium cursor-pointer">24-Bit Masters</span>
        </div>

        <div className="space-y-2">
          {tracks.filter((t) => t.isHiRes).map((track, idx) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track, tracks.indexOf(track))}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c1c1e]/60 hover:bg-[#252528] border border-white/[0.06] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white truncate">{track.title}</h4>
                  <p className="text-[11px] text-[#8e8e93] truncate">{track.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {track.bitDepth}b/{formatSampleRate(track.sampleRate)}
                </span>
                <Play className="w-4 h-4 text-[#fa2d48] fill-[#fa2d48]" />
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

    </div>
  );
};
