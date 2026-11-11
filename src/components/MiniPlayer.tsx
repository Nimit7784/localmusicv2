/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, SkipForward, ChevronUp } from 'lucide-react';
import { AudioTrack } from '../types/audio';
import { formatSampleRate } from '../utils/formatters';

interface MiniPlayerProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onExpand,
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={onExpand}
      className="absolute bottom-[66px] left-3 right-3 z-30 bg-[#161922]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl cursor-pointer select-none transition-all active:scale-[0.99] overflow-hidden"
    >
      {/* Precision hairline progress indicator */}
      <div className="w-full h-1 bg-white/[0.06] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="px-3.5 py-2 flex items-center justify-between gap-3">
        {/* Track Info & Artwork */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#181f2d] shrink-0 border border-slate-700/60 shadow-sm">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-100 truncate">
                {currentTrack.title}
              </h4>
              <span className="text-[10px] font-mono text-amber-400 shrink-0 font-medium hidden xs:inline">
                {currentTrack.format} · {currentTrack.bitDepth}b/{formatSampleRate(currentTrack.sampleRate)}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {currentTrack.artist} <span className="text-slate-600">·</span> {currentTrack.album}
            </p>
          </div>
        </div>

        {/* Playback Action Buttons */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            title="Next Track"
            className="w-10 h-10 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onExpand}
            title="Expand Full Player"
            className="w-10 h-10 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors hidden sm:flex"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
