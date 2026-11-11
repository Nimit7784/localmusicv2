/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Search, Disc, User, Sparkles, FolderPlus, ArrowUpDown, Music } from 'lucide-react';
import { AudioTrack } from '../types/audio';
import { LibraryViewTab } from './Header';
import { TrackItem } from './TrackItem';
import { formatBytes, formatTime } from '../utils/formatters';

interface LibraryViewProps {
  tracks: AudioTrack[];
  activeTab: LibraryViewTab;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: AudioTrack, index: number) => void;
  onPlayNext: (track: AudioTrack) => void;
  onAddToQueue: (track: AudioTrack) => void;
  onShowDetails: (track: AudioTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onOpenImport: () => void;
  onLoadDemos: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  activeTab,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayNext,
  onAddToQueue,
  onShowDetails,
  onDeleteTrack,
  onOpenImport,
  onLoadDemos,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'flac' | 'wav' | 'hires'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'date' | 'hires'>('title');

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      // Tab filter
      if (activeTab === 'hires' && !t.isHiRes) return false;

      // Format filter
      if (formatFilter === 'flac' && t.format !== 'FLAC') return false;
      if (formatFilter === 'wav' && t.format !== 'WAV') return false;
      if (formatFilter === 'hires' && !t.isHiRes) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.format.toLowerCase().includes(q)
        );
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'date') return b.dateAdded - a.dateAdded;
      if (sortBy === 'hires') return (b.isHiRes ? 1 : 0) - (a.isHiRes ? 1 : 0);
      return 0;
    });
  }, [tracks, activeTab, formatFilter, searchQuery, sortBy]);

  // Grouped by Album
  const albums = useMemo(() => {
    const map = new Map<string, { album: string; artist: string; coverUrl?: string; tracks: AudioTrack[] }>();
    tracks.forEach((t) => {
      const key = `${t.album}-${t.artist}`;
      if (!map.has(key)) {
        map.set(key, { album: t.album, artist: t.artist, coverUrl: t.coverUrl, tracks: [] });
      }
      map.get(key)!.tracks.push(t);
    });
    return Array.from(map.values());
  }, [tracks]);

  // Grouped by Artist
  const artists = useMemo(() => {
    const map = new Map<string, { artist: string; albums: Set<string>; tracks: AudioTrack[] }>();
    tracks.forEach((t) => {
      if (!map.has(t.artist)) {
        map.set(t.artist, { artist: t.artist, albums: new Set(), tracks: [] });
      }
      const entry = map.get(t.artist)!;
      entry.albums.add(t.album);
      entry.tracks.push(t);
    });
    return Array.from(map.values());
  }, [tracks]);

  const totalDuration = useMemo(() => tracks.reduce((acc, t) => acc + (t.duration || 0), 0), [tracks]);
  const totalSize = useMemo(() => tracks.reduce((acc, t) => acc + (t.fileSize || 0), 0), [tracks]);

  return (
    <div className="w-full flex-1 flex flex-col px-3 py-2 space-y-3 pb-28 select-none">
      
      {/* Android Material 3 Category Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setFormatFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            formatFilter === 'all'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-[#141720] text-slate-300 hover:bg-[#1a1e2a]'
          }`}
        >
          All Songs ({tracks.length})
        </button>
        <button
          onClick={() => setFormatFilter('hires')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            formatFilter === 'hires'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-[#141720] text-slate-300 hover:bg-[#1a1e2a]'
          }`}
        >
          24-Bit Hi-Res
        </button>
        <button
          onClick={() => setFormatFilter('flac')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            formatFilter === 'flac'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-[#141720] text-slate-300 hover:bg-[#1a1e2a]'
          }`}
        >
          FLAC
        </button>
        <button
          onClick={() => setFormatFilter('wav')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            formatFilter === 'wav'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-[#141720] text-slate-300 hover:bg-[#1a1e2a]'
          }`}
        >
          WAV
        </button>
      </div>

      {/* Android Search & Sort Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search titles, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12141a] border border-white/[0.06] text-slate-200 placeholder-slate-500 text-xs rounded-full pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-400/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Android Sort selector */}
        <div className="flex items-center px-3 py-2 rounded-full bg-[#12141a] border border-white/[0.06] text-xs text-slate-300 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'artist' | 'date' | 'hires')}
            aria-label="Sort tracks"
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            <option value="title" className="bg-[#12141a]">Title</option>
            <option value="artist" className="bg-[#12141a]">Artist</option>
            <option value="hires" className="bg-[#12141a]">Hi-Res</option>
            <option value="date" className="bg-[#12141a]">Recent</option>
          </select>
        </div>
      </div>
      {/* Library Summary Header (Unboxed text metadata) */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span>{filteredTracks.length} Tracks</span>
          <span aria-hidden="true">·</span>
          <span>{formatTime(totalDuration)} Total</span>
          <span aria-hidden="true">·</span>
          <span>{formatBytes(totalSize)} Local Storage</span>
        </div>
      </div>

      {/* Main Tab View Routing */}
      {activeTab === 'albums' ? (
        // Albums Grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((item) => (
            <div
              key={`${item.album}-${item.artist}`}
              onClick={() => onPlayTrack(item.tracks[0], tracks.indexOf(item.tracks[0]))}
              className="group p-3 rounded-2xl bg-[#121620]/70 hover:bg-[#161c28] border border-slate-800/80 cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 mb-3 border border-slate-800">
                <img
                  src={item.coverUrl}
                  alt={item.album}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                    <Disc className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-amber-400">
                {item.album}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">{item.artist}</p>
              <span className="text-[11px] font-mono text-slate-500 block mt-1">
                {item.tracks.length} tracks
              </span>
            </div>
          ))}
        </div>
      ) : activeTab === 'artists' ? (
        // Artists Grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {artists.map((item) => (
            <div
              key={item.artist}
              onClick={() => onPlayTrack(item.tracks[0], tracks.indexOf(item.tracks[0]))}
              className="p-4 rounded-2xl bg-[#121620]/70 hover:bg-[#161c28] border border-slate-800/80 cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-xl mb-3 shadow-lg shadow-amber-500/10">
                <User className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-100 truncate">{item.artist}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {item.albums.size} albums · {item.tracks.length} tracks
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Tracks List
        <div className="space-y-2">
          {filteredTracks.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-[#0f131c]/50">
              <Music className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">No Audio Tracks Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchQuery
                  ? 'No local tracks matched your search query.'
                  : 'Add FLAC, WAV, AIFF, or ALAC files from your Android phone or computer.'}
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={onOpenImport}
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg hover:bg-amber-300 transition-colors"
                >
                  Import Local Audio
                </button>
                <button
                  onClick={onLoadDemos}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-medium text-xs rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Load 24b/96k Demos
                </button>
              </div>
            </div>
          ) : (
            filteredTracks.map((track, idx) => (
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
            ))
          )}
        </div>
      )}

    </div>
  );
};
