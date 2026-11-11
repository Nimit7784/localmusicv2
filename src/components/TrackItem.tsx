/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Pause, MoreVertical, ListPlus, Info, Trash2 } from 'lucide-react';
import { AudioTrack } from '../types/audio';
import { formatBitrate, formatSampleRate, formatTime } from '../utils/formatters';

interface TrackItemProps {
  track: AudioTrack;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
  onShowDetails: () => void;
  onDelete: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onShowDetails,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onClick={onPlay}
      className={`group relative flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer active:bg-white/10 ${
        isCurrent
          ? 'bg-white/[0.08] shadow-sm'
          : 'hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        
        {/* Track Artwork / Apple Music animated waveform */}
        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#1c1c1e] shrink-0 shadow-sm border border-white/[0.08]">
          <img
            src={track.coverUrl}
            alt={track.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Active play overlay */}
          {isCurrent ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className="w-0.5 bg-[#fa2d48] animate-[bounce_0.8s_infinite] h-3 rounded-full" />
                  <span className="w-0.5 bg-[#fa2d48] animate-[bounce_0.6s_infinite_0.2s] h-3.5 rounded-full" />
                  <span className="w-0.5 bg-[#fa2d48] animate-[bounce_0.7s_infinite_0.4s] h-2 rounded-full" />
                </div>
              ) : (
                <Pause className="w-3.5 h-3.5 text-[#fa2d48] fill-[#fa2d48]" />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            </div>
          )}
        </div>

        {/* Title, Artist, and Apple Music format tags */}
        <div className="min-w-0 flex-1">
          <h4
            className={`text-sm font-semibold truncate tracking-tight ${
              isCurrent ? 'text-[#fa2d48]' : 'text-white'
            }`}
          >
            {track.title}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-[#8e8e93] truncate mt-0.5">
            <span className="truncate">{track.artist}</span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span className="truncate text-[#8e8e93]/80">{track.album}</span>
          </div>

          {/* Apple Music metadata specs */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8e8e93] mt-0.5">
            <span className={track.isHiRes ? 'text-white font-medium' : 'text-[#8e8e93]'}>
              {track.format}
            </span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span className="tabular-nums">
              {track.bitDepth}b/{formatSampleRate(track.sampleRate)}
            </span>
            {track.isHiRes && (
              <>
                <span aria-hidden="true" className="text-white/20">·</span>
                <span className="text-[#fa2d48] font-sans font-semibold uppercase tracking-wider text-[9px]">
                  Hi-Res
                </span>
              </>
            )}
          </div>
        </div>
      </div>

        {/* Right side: Duration & Actions */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {formatTime(track.duration)}
        </span>

        {/* Context options menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-full text-[#8e8e93] hover:text-white hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl glass-panel border border-white/[0.18] shadow-2xl p-1.5 z-50 text-xs backdrop-blur-2xl bg-black/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayNext();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white hover:bg-white/10 text-left transition-colors font-medium"
                >
                  <ListPlus className="w-4 h-4 text-[#fa2d48]" />
                  <span>Play Next</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 text-left transition-colors font-medium"
                >
                  <ListPlus className="w-4 h-4 text-[#8e8e93]" />
                  <span>Add to Queue</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowDetails();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 text-left transition-colors font-medium"
                >
                  <Info className="w-4 h-4 text-[#8e8e93]" />
                  <span>Audio Specs</span>
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/15 text-left transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Track</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
