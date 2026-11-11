/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trash2, Music2, Link2, Play, ListMusic } from 'lucide-react';
import { AudioTrack, GaplessMode } from '../types/audio';
import { formatTime } from '../utils/formatters';

interface QueueSheetProps {
  isOpen: boolean;
  onClose: () => void;
  queue: AudioTrack[];
  queueIndex: number;
  gaplessMode: GaplessMode;
  onPlayTrackAtIndex: (index: number) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export const QueueSheet: React.FC<QueueSheetProps> = ({
  isOpen,
  onClose,
  queue,
  queueIndex,
  gaplessMode,
  onPlayTrackAtIndex,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg glass-panel bg-black/85 border border-white/[0.18] rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10 max-h-[85vh]">
        {/* Specular gloss top reflection */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Grab handle for mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2 sm:hidden relative z-10" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1] bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48]">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Playing Next</h3>
              <p className="text-[11px] font-mono text-[#8e8e93]">
                {queue.length} {queue.length === 1 ? 'track' : 'tracks'} queued
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full border border-red-500/20 transition-all font-medium"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gapless status pill notification */}
        <div className="bg-white/[0.03] px-6 py-2.5 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono relative z-10">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Link2 className="w-3.5 h-3.5" />
            <span className="font-semibold">Gapless Mode: {gaplessMode.toUpperCase()}</span>
          </div>
          <span className="text-[#8e8e93] text-[11px]">Seamless Buffer Handoff</span>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar relative z-10">
          {queue.length === 0 ? (
            <div className="text-center py-14 text-[#8e8e93]">
              <Music2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-white" />
              <p className="text-sm font-semibold text-white/70">Queue is empty</p>
              <p className="text-xs text-[#8e8e93] mt-1">Play any track to queue it for gapless playback</p>
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              const isNext = idx === queueIndex + 1;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => onPlayTrackAtIndex(idx)}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#fa2d48]/15 border-[#fa2d48]/40 text-[#fa2d48] shadow-md shadow-[#fa2d48]/10'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/10">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-[#fa2d48] fill-[#fa2d48]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold truncate tracking-tight text-white">{track.title}</h4>
                        {isNext && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                            Up Next
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8e8e93] truncate mt-0.5">
                        {track.artist} · <span className="font-mono text-[11px] text-white/60">{track.format}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs font-mono text-[#8e8e93] tabular-nums">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromQueue(idx);
                      }}
                      className="p-1 rounded-full text-[#8e8e93] hover:text-red-400 hover:bg-white/10 transition-colors"
                      title="Remove from queue"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
