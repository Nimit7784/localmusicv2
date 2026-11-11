/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Folder, FolderOpen, Play, ChevronRight, HardDrive, ArrowLeft, Plus } from 'lucide-react';
import { AudioTrack } from '../types/audio';
import { TrackItem } from './TrackItem';
import { formatBytes, formatTime } from '../utils/formatters';

interface FolderBrowserProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: AudioTrack, index: number) => void;
  onPlayFolder: (folderTracks: AudioTrack[]) => void;
  onPlayNext: (track: AudioTrack) => void;
  onAddToQueue: (track: AudioTrack) => void;
  onShowDetails: (track: AudioTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onOpenImport: () => void;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayFolder,
  onPlayNext,
  onAddToQueue,
  onShowDetails,
  onDeleteTrack,
  onOpenImport,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Group tracks by folder path
  const folderMap = React.useMemo(() => {
    const map = new Map<string, AudioTrack[]>();
    tracks.forEach((track) => {
      const folder = track.folderPath || '/storage/emulated/0/Music';
      if (!map.has(folder)) {
        map.set(folder, []);
      }
      map.get(folder)!.push(track);
    });
    return map;
  }, [tracks]);

  const folderList = Array.from(folderMap.entries()).map(([path, folderTracks]) => {
    const folderName = path.split('/').filter(Boolean).pop() || 'Music';
    const totalSize = folderTracks.reduce((acc, t) => acc + (t.fileSize || 0), 0);
    const totalDuration = folderTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    const hiResCount = folderTracks.filter((t) => t.isHiRes).length;
    return {
      path,
      name: folderName,
      tracks: folderTracks,
      totalSize,
      totalDuration,
      hiResCount,
    };
  });

  const activeFolderData = selectedFolder
    ? folderList.find((f) => f.path === selectedFolder)
    : null;

  return (
    <div className="w-full flex-1 flex flex-col p-4 space-y-4 pb-28 select-none">
      
      {/* Breadcrumb Navigation Header */}
      <div className="flex items-center justify-between bg-[#12141a] p-3 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 truncate">
          <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
          {selectedFolder ? (
            <div className="flex items-center gap-1.5 truncate">
              <button
                onClick={() => setSelectedFolder(null)}
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Internal Storage</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="text-slate-100 font-semibold truncate">{activeFolderData?.name}</span>
            </div>
          ) : (
            <span className="truncate">/storage/emulated/0/Music</span>
          )}
        </div>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Scan Folder</span>
        </button>
      </div>

      {/* If inside a folder, show folder contents */}
      {selectedFolder && activeFolderData ? (
        <div className="space-y-3">
          {/* Folder action bar */}
          <div className="flex items-center justify-between bg-[#161922] p-3 rounded-2xl border border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{activeFolderData.name}</h3>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {activeFolderData.tracks.length} Tracks · {formatTime(activeFolderData.totalDuration)} · {formatBytes(activeFolderData.totalSize)}
              </p>
            </div>

            <button
              onClick={() => onPlayFolder(activeFolderData.tracks)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 hover:bg-amber-300 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Gapless</span>
            </button>
          </div>

          {/* Track list inside folder */}
          <div className="space-y-1.5">
            {activeFolderData.tracks.map((track, idx) => (
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
        </div>
      ) : (
        // Root Directory List
        <div className="space-y-2">
          {folderList.length === 0 ? (
            <div className="text-center py-16 text-slate-500 border border-dashed border-white/[0.08] rounded-2xl">
              <Folder className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="text-sm font-medium text-slate-300">No device audio folders found</p>
              <p className="text-xs text-slate-500 mt-1">Tap Scan Folder above to import your local storage files</p>
            </div>
          ) : (
            folderList.map((folder) => (
              <div
                key={folder.path}
                onClick={() => setSelectedFolder(folder.path)}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#12141a] hover:bg-[#181b24] border border-white/[0.06] hover:border-amber-400/30 cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Folder className="w-5 h-5 fill-amber-400/20" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-amber-400">
                        {folder.name}
                      </h4>
                      {folder.hiResCount > 0 && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 shrink-0">
                          {folder.hiResCount} Hi-Res
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
                      {folder.path}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-1">
                      <span>{folder.tracks.length} songs</span>
                      <span>·</span>
                      <span>{formatTime(folder.totalDuration)}</span>
                      <span>·</span>
                      <span>{formatBytes(folder.totalSize)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayFolder(folder.tracks);
                    }}
                    title="Play Folder"
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
