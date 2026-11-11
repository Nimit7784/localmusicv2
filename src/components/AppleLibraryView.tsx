/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ListMusic,
  User,
  Disc,
  Music2,
  Download,
  FolderOpen,
  ChevronRight,
  Plus,
  ArrowUpDown,
  Moon,
  Sliders,
} from 'lucide-react';
import { AudioTrack, SleepTimerState } from '../types/audio';
import { TrackItem } from './TrackItem';
import { formatTime } from '../utils/formatters';

interface AppleLibraryViewProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  sleepTimerState?: SleepTimerState;
  onPlayTrack: (track: AudioTrack, index: number) => void;
  onPlayNext: (track: AudioTrack) => void;
  onAddToQueue: (track: AudioTrack) => void;
  onShowDetails: (track: AudioTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onOpenImport: () => void;
  onOpenSettings?: () => void;
}

export const AppleLibraryView: React.FC<AppleLibraryViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  sleepTimerState,
  onPlayTrack,
  onPlayNext,
  onAddToQueue,
  onShowDetails,
  onDeleteTrack,
  onOpenImport,
  onOpenSettings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'albums' | 'artists' | 'hires' | 'downloaded'>('all');

  const categories = [
    { id: 'all', label: 'Songs', icon: Music2, count: tracks.length },
    { id: 'albums', label: 'Albums', icon: Disc, count: new Set(tracks.map((t) => t.album)).size },
    { id: 'artists', label: 'Artists', icon: User, count: new Set(tracks.map((t) => t.artist)).size },
    { id: 'hires', label: 'Hi-Res Lossless', icon: ListMusic, count: tracks.filter((t) => t.isHiRes).length },
    { id: 'downloaded', label: 'Device Storage', icon: Download, count: tracks.length },
  ];

  const displayedTracks = tracks.filter((t) => {
    if (selectedCategory === 'hires') return t.isHiRes;
    return true;
  });

  return (
    <div className="w-full flex-1 flex flex-col p-4 space-y-6 pb-28 select-none overflow-y-auto no-scrollbar">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Library</h1>
        <div className="flex items-center gap-2">
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

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill border border-[#fa2d48]/50 text-[#fa2d48] text-xs font-bold shadow-[0_0_14px_rgba(250,45,72,0.25)] hover:bg-[#fa2d48]/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Music</span>
          </button>
        </div>
      </div>

      {/* Signature Apple Music Lucid Glass Library Rows */}
      <div className="glass-card rounded-3xl overflow-hidden divide-y divide-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
              className={`flex items-center justify-between px-4 py-3.5 cursor-pointer active:bg-white/10 transition-colors ${
                isSelected ? 'bg-white/[0.06]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-[#fa2d48]' : 'text-[#fa2d48]/90'}`} />
                <span className="text-sm font-semibold text-white">{cat.label}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8e8e93] font-mono">{cat.count}</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          );
        })}

        {/* Dedicated Sleep Timer & Settings Row */}
        {onOpenSettings && (
          <div
            onClick={onOpenSettings}
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer active:bg-white/10 transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
          >
            <div className="flex items-center gap-3">
              <Moon className={`w-5 h-5 ${sleepTimerState?.active ? 'text-violet-400 animate-pulse' : 'text-violet-400/90'}`} />
              <div>
                <span className="text-sm font-semibold text-white">Sleep Timer & Settings</span>
                <p className="text-[11px] text-[#8e8e93]">
                  {sleepTimerState?.active
                    ? sleepTimerState.mode === 'track_end'
                      ? 'Stops when song ends'
                      : `Stops in ${formatTime(sleepTimerState.remainingSeconds)}`
                    : 'Auto-stop playback & audio engine'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {sleepTimerState?.active ? (
                <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/20 border border-violet-500/40 px-2 py-0.5 rounded-full">
                  {sleepTimerState.mode === 'track_end' ? 'TRACK END' : formatTime(sleepTimerState.remainingSeconds)}
                </span>
              ) : (
                <span className="text-xs text-[#8e8e93] font-mono">Off</span>
              )}
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </div>
        )}
      </div>

      {/* Recently Added Section / Track List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Recently Added</h2>
          <span className="text-xs text-[#8e8e93] font-mono">
            {displayedTracks.length} Songs
          </span>
        </div>

        {displayedTracks.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center space-y-4 border border-white/[0.08]">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#8e8e93]">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Your Library is Empty</h3>
              <p className="text-xs text-[#8e8e93] max-w-[260px] mx-auto">
                No songs imported yet. Add FLAC, WAV, ALAC, or MP3 files from your device storage.
              </p>
            </div>
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fa2d48] text-white text-xs font-semibold shadow-md shadow-[#fa2d48]/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Import Music</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {displayedTracks.map((track, idx) => (
              <TrackItem
                key={track.id}
                track={track}
                index={idx}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={() => onPlayTrack(track, idx)}
                onPlayNext={() => onPlayNext(track)}
                onAddToQueue={() => onAddToQueue(track)}
                onShowDetails={() => onShowDetails(track)}
                onDelete={() => onDeleteTrack(track.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
