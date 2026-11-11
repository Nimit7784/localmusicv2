/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { X, FolderOpen, UploadCloud, FileAudio, CheckCircle2, Loader2, HardDrive, Smartphone } from 'lucide-react';
import { parseAudioFile } from '../audio/metadataExtractor';
import { AudioTrack } from '../types/audio';
import { formatBytes } from '../utils/formatters';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTracksImported: (tracks: AudioTrack[]) => void;
  storageUsage: { usedBytes: number; trackCount: number };
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onTracksImported,
  storageUsage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ['flac', 'wav', 'aiff', 'aif', 'alac', 'm4a', 'aac', 'mp3', 'ogg', 'opus'].includes(ext || '') ||
        f.type.startsWith('audio/');
    });

    if (files.length === 0) {
      setStatusMessage('No supported audio files found in selection.');
      return;
    }

    setIsProcessing(true);
    const parsedTracks: AudioTrack[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatusMessage(`Decoding & parsing metadata: ${file.name} (${i + 1}/${files.length})`);
      setProgressPercent(Math.round(((i + 1) / files.length) * 100));

      try {
        const track = await parseAudioFile(file);
        parsedTracks.push(track);
      } catch (err) {
        console.warn('Error parsing file:', file.name, err);
      }
    }

    setIsProcessing(false);
    setStatusMessage(`Successfully imported ${parsedTracks.length} high-fidelity tracks!`);
    onTracksImported(parsedTracks);

    setTimeout(() => {
      onClose();
      setStatusMessage('');
      setProgressPercent(0);
    }, 900);
  };

  // Try Directory Picker API (Modern Chrome / Android)
  const handleScanDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
        setIsProcessing(true);
        setStatusMessage('Scanning directory recursively for Hi-Res audio...');

        const collectedFiles: File[] = [];

        async function scanDir(handle: FileSystemDirectoryHandle) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const ext = file.name.split('.').pop()?.toLowerCase();
              if (['flac', 'wav', 'aiff', 'aif', 'alac', 'm4a', 'aac', 'mp3', 'ogg', 'opus'].includes(ext || '') ||
                  file.type.startsWith('audio/')) {
                collectedFiles.push(file);
              }
            } else if (entry.kind === 'directory') {
              await scanDir(entry);
            }
          }
        }

        await scanDir(dirHandle);
        await handleFiles(collectedFiles);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Directory scan fallback to standard picker:', err);
          folderInputRef.current?.click();
        }
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      
      <div className="absolute inset-0" onClick={!isProcessing ? onClose : undefined} />

      <div className="relative w-full max-w-lg glass-panel bg-black/85 border border-white/[0.18] rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10">
        {/* Specular glass reflection */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-[32px]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1] bg-white/[0.02] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fa2d48]/15 border border-[#fa2d48]/30 flex items-center justify-center text-[#fa2d48]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add Music from Device</h3>
              <p className="text-xs text-[#8e8e93]">
                FLAC (24-bit/192kHz), WAV, ALAC, AAC, OPUS, MP3
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 relative z-10">
          
          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleScanDirectory}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center p-5 rounded-2xl glass-card bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#fa2d48]/50 text-center transition-all group active:scale-[0.98] disabled:opacity-50 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#fa2d48]/15 border border-[#fa2d48]/30 text-[#fa2d48] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(250,45,72,0.25)]">
                <FolderOpen className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-white">Scan Music Folder</span>
              <span className="text-[11px] text-[#8e8e93] mt-1">Import entire device storage</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center p-5 rounded-2xl glass-card bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#fa2d48]/50 text-center transition-all group active:scale-[0.98] disabled:opacity-50 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#fa2d48]/15 border border-[#fa2d48]/30 text-[#fa2d48] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(250,45,72,0.25)]">
                <FileAudio className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-white">Select Audio Files</span>
              <span className="text-[11px] text-[#8e8e93] mt-1">Pick specific FLAC, WAV, MP3</span>
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            className="border border-dashed border-white/20 hover:border-[#fa2d48]/60 rounded-2xl p-6 text-center transition-all bg-white/[0.02]"
          >
            <UploadCloud className="w-8 h-8 text-[#8e8e93] mx-auto mb-2" />
            <p className="text-xs text-white/90 font-medium">Or drop audio files anywhere in this window</p>
            <p className="text-[11px] text-[#8e8e93] mt-1">Stored securely offline in IndexedDB on device</p>
          </div>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".flac,.wav,.aiff,.aif,.alac,.mp3,.m4a,.aac,.ogg,.opus,audio/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory is standard for folder picker
            webkitdirectory="true"
            directory=""
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          {/* Processing / Progress State */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-[#fa2d48]/40 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#fa2d48]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="truncate max-w-[260px] text-white/90">{statusMessage}</span>
                </div>
                <span className="text-white font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#fa2d48] transition-all duration-150 rounded-full shadow-[0_0_10px_rgba(250,45,72,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Storage stats */}
          <div className="flex items-center justify-between text-xs font-mono text-[#8e8e93] pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#8e8e93]" />
              <span>Device Offline Storage:</span>
            </div>
            <span className="text-white font-medium">
              {formatBytes(storageUsage.usedBytes)} ({storageUsage.trackCount} tracks)
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
