/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Sparkles, Disc3, Plus, Music2, Headphones, Radio, Waves, Moon } from 'lucide-react';
import { AudioTrack, SleepTimerState } from '../types/audio';

interface AppleBrowseViewProps {
  tracks: AudioTrack[];
  sleepTimerState?: SleepTimerState;
  onPlayTrack: (track: AudioTrack, index: number) => void;
  onOpenImport?: () => void;
  onOpenSettings?: () => void;
}

export const AppleBrowseView: React.FC<AppleBrowseViewProps> = ({
  tracks,
  sleepTimerState,
  onPlayTrack,
  onOpenImport,
  onOpenSettings,
}) => {
  const genres = [
    { name: 'Spatial Audio', subtitle: 'Atmos 7.1.4 Mastering', gradient: 'from-[#fa2d48]/80 to-[#9c27b0]/80' },
    { name: 'Hi-Res Lossless', subtitle: '24-Bit / 192kHz Master', gradient: 'from-[#ff9800]/80 to-[#f44336]/80' },
    { name: 'Pure Acoustic', subtitle: 'Natural Reverberation', gradient: 'from-[#009688]/80 to-[#3f51b5]/80' },
    { name: 'Late Night Jazz', subtitle: 'Warm Ribbon Mic Rec', gradient: 'from-[#3f51b5]/80 to-[#2196f3]/80' },
    { name: 'Studio Reference', subtitle: 'Flat Response Neutral', gradient: 'from-[#673ab7]/80 to-[#e91e63]/80' },
    { name: 'Ambient Synthesis', subtitle: 'Analog Modular Drift', gradient: 'from-[#00bcd4]/80 to-[#009688]/80' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col p-4 space-y-6 pb-28 select-none overflow-y-auto no-scrollbar">
      
      {/* Page Title */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Browse</h1>
          <p className="text-xs text-[#8e8e93] mt-0.5">Explore featured lossless studio albums</p>
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

      {/* Featured Editorial Carousel */}
      {tracks.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-sm font-bold text-white tracking-tight">Featured Albums</h2>
            <span className="text-[10px] font-mono text-[#fa2d48] uppercase tracking-wider">Hi-Res Masters</span>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-1">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, idx)}
                className="w-56 shrink-0 rounded-2xl glass-card p-3.5 cursor-pointer shadow-xl active:scale-[0.98] transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />

                <span className="text-[10px] font-bold text-[#fa2d48] uppercase tracking-wider block font-mono">
                  {track.isHiRes ? 'HI-RES LOSSLESS' : 'LOSSLESS AUDIO'}
                </span>
                <h4 className="text-sm font-bold text-white truncate mt-0.5 group-hover:text-[#fa2d48] transition-colors">
                  {track.album || track.title}
                </h4>
                <p className="text-xs text-[#8e8e93] truncate">{track.artist}</p>

                <div className="relative aspect-video rounded-xl overflow-hidden mt-3 shadow-md border border-white/[0.08]">
                  <img
                    src={track.coverUrl}
                    alt={track.album}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[#fa2d48] flex items-center justify-center text-white shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State with Lucid Glass Billboard */
        <div className="glass-card rounded-3xl p-6 text-center space-y-4 border border-white/[0.14] relative overflow-hidden">
          {/* Specular gloss top reflection */}
          <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-3xl" />

          <div className="w-14 h-14 rounded-2xl bg-[#fa2d48]/15 border border-[#fa2d48]/30 text-[#fa2d48] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(250,45,72,0.3)]">
            <Waves className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">Pure Lossless Studio Sound</h3>
            <p className="text-xs text-[#8e8e93] max-w-[280px] mx-auto leading-relaxed">
              Import your FLAC, WAV, and ALAC library to browse studio masters with sample-accurate gapless playback.
            </p>
          </div>

          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fa2d48] hover:bg-[#fa2d48]/90 text-white text-xs font-semibold shadow-lg shadow-[#fa2d48]/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Music from Device</span>
            </button>
          )}
        </div>
      )}

      {/* Apple Music Editorial Category Tiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-base font-bold text-white tracking-tight">Browse Categories</h2>
          <span className="text-[11px] font-mono text-[#8e8e93]">Curated</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {genres.map((g) => (
            <div
              key={g.name}
              onClick={() => {
                if (tracks.length > 0) onPlayTrack(tracks[0], 0);
              }}
              className={`h-28 rounded-2xl p-3.5 bg-gradient-to-br ${g.gradient} backdrop-blur-xl border border-white/[0.18] flex flex-col justify-between shadow-lg cursor-pointer active:scale-95 transition-all group relative overflow-hidden`}
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-2xl" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/80 relative z-10">
                {g.subtitle}
              </span>
              <span className="text-sm font-bold text-white tracking-tight leading-snug relative z-10 group-hover:translate-x-0.5 transition-transform">
                {g.name}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
