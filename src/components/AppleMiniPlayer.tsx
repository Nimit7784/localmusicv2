/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, FastForward } from 'lucide-react';
import { AudioTrack } from '../types/audio';

interface AppleMiniPlayerProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export const AppleMiniPlayer: React.FC<AppleMiniPlayerProps> = ({
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
      className="absolute bottom-[68px] left-3 right-3 z-30 glass-card rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6),_inset_0_1px_1px_rgba(255,255,255,0.25)] cursor-pointer select-none transition-all active:scale-[0.99] overflow-hidden"
    >
      {/* Hairline Progress Scrubber with Lucid Glow */}
      <div className="w-full h-[2px] bg-white/[0.1] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#fa2d48] to-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between gap-3">
        {/* Album Artwork & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#1c1c1e] shrink-0 shadow-md">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate tracking-tight">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-[#98989d] truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Apple Music Actions */}
        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white text-white" />
            ) : (
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 active:scale-90 transition-transform"
            title="Next Track"
          >
            <FastForward className="w-5 h-5 fill-white/90 text-white/90" />
          </button>
        </div>
      </div>
    </div>
  );
};
