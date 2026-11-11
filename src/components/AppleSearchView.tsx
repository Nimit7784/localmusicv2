/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, X, Music, Play } from 'lucide-react';
import { AudioTrack } from '../types/audio';
import { TrackItem } from './TrackItem';

interface AppleSearchViewProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: AudioTrack, index: number) => void;
  onPlayNext: (track: AudioTrack) => void;
  onAddToQueue: (track: AudioTrack) => void;
  onShowDetails: (track: AudioTrack) => void;
  onDeleteTrack: (trackId: string) => void;
}

export const AppleSearchView: React.FC<AppleSearchViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayNext,
  onAddToQueue,
  onShowDetails,
  onDeleteTrack,
}) => {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? tracks.filter((t) => {
        const q = query.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.format.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="w-full flex-1 flex flex-col p-4 space-y-5 pb-28 select-none overflow-y-auto">
      
      {/* Title */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Search</h1>
      </div>

      {/* Apple Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Artists, Songs, Lyrics, and Formats"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full glass-card bg-white/[0.06] backdrop-blur-xl border border-white/[0.14] text-white placeholder-[#8e8e93] text-sm rounded-2xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#fa2d48]/60 focus:bg-white/[0.1] transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white/80 absolute right-3 top-1/2 -translate-y-1/2 hover:text-white hover:bg-white/30 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Results or Browse Categories */}
      {query.trim() ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#8e8e93]">
              {filtered.length} {filtered.length === 1 ? 'Result' : 'Results'}
            </h2>
            <span className="text-[10px] text-white/40 font-mono">Hi-Fi Index</span>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-[#8e8e93] my-4 border border-white/[0.08]">
              <Search className="w-8 h-8 text-[#8e8e93]/50 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white/80">No results found for "{query}"</p>
              <p className="text-xs text-[#8e8e93] mt-1">Check spelling or search for FLAC, WAV, ALAC, or artist name</p>
            </div>
          ) : (
            <div className="space-y-1 glass-card rounded-2xl p-2 border border-white/[0.1] bg-white/[0.03]">
              {filtered.map((track, idx) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={idx}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  onPlay={() => onPlayTrack(track, tracks.indexOf(track))}
                  onPlayNext={() => onPlayNext(track)}
                  onAddToQueue={() => onAddToQueue(track)}
                  onShowDetails={() => onShowDetails(track)}
                  onDelete={() => onDeleteTrack(track.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-base font-bold text-white tracking-tight">Browse Categories</h2>
            <span className="text-[11px] font-mono text-[#fa2d48]">Lossless Masters</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Spatial Audio', subtitle: 'Dolby Atmos Master', gradient: 'from-[#fa2d48]/80 to-[#9c27b0]/80' },
              { name: 'Hi-Res Lossless', subtitle: '24-Bit / 192kHz PCM', gradient: 'from-[#ff9800]/80 to-[#f44336]/80' },
              { name: 'Pure Acoustic', subtitle: 'Uncompressed Live', gradient: 'from-[#009688]/80 to-[#3f51b5]/80' },
              { name: 'Late Night Jazz', subtitle: 'Studio Sessions', gradient: 'from-[#3f51b5]/80 to-[#2196f3]/80' },
              { name: 'Reference Classical', subtitle: 'Dynamic Symphony', gradient: 'from-[#673ab7]/80 to-[#e91e63]/80' },
              { name: 'Ambient Electronic', subtitle: 'Analog Synthesizers', gradient: 'from-[#00bcd4]/80 to-[#009688]/80' },
            ].map((item) => (
              <div
                key={item.name}
                onClick={() => setQuery(item.name.split(' ')[0])}
                className={`relative overflow-hidden h-28 rounded-2xl p-3.5 bg-gradient-to-br ${item.gradient} backdrop-blur-xl border border-white/[0.18] flex flex-col justify-between shadow-lg cursor-pointer active:scale-95 transition-all group`}
              >
                {/* Specular glass gloss highlight */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-2xl" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/80 relative z-10">
                  {item.subtitle}
                </span>
                <span className="text-sm font-bold text-white tracking-tight leading-tight relative z-10 group-hover:translate-x-0.5 transition-transform">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

