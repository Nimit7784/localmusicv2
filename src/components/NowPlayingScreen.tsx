/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Sliders,
  ListMusic,
  Info,
  Activity,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AudioEngineSettings, AudioTrack, GaplessMode } from '../types/audio';
import { formatBitrate, formatSampleRate, formatTime } from '../utils/formatters';
import { VisualizerCanvas } from './VisualizerCanvas';

interface NowPlayingScreenProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
  settings: AudioEngineSettings;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onSetVolume: (vol: number) => void;
  onSetGaplessMode: (mode: GaplessMode) => void;
  onToggleBitPerfect: () => void;
  onOpenEQ: () => void;
  onOpenQueue: () => void;
  onShowDetails: () => void;
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  settings,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onToggleRepeat,
  onToggleShuffle,
  onSetVolume,
  onSetGaplessMode,
  onToggleBitPerfect,
  onOpenEQ,
  onOpenQueue,
  onShowDetails,
}) => {
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);

  // Touch swipe gesture for Android album art
  const touchStartX = useRef<number | null>(null);

  if (!currentTrack) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 pb-28">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/[0.06] flex items-center justify-center mb-4 text-slate-600">
          <Play className="w-8 h-8 ml-1" />
        </div>
        <h3 className="text-base font-bold text-slate-300">No Track Playing</h3>
        <p className="text-xs text-slate-500 mt-1">Select a track or folder from your library to start listening</p>
      </div>
    );
  }

  const displayTime = isSeeking ? seekTime : currentTime;
  const remainingTime = Math.max(0, duration - displayTime);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 60) {
      onPrevious(); // Swipe right -> Previous
    } else if (diff < -60) {
      onNext(); // Swipe left -> Next
    }
    touchStartX.current = null;
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between p-4 md:p-6 pb-28 select-none overflow-y-auto">
      
      {/* Top Bar inside Player Screen */}
      <div className="flex items-center justify-between py-1 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12141a] border border-white/[0.06] text-[11px] font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="truncate max-w-[140px]">{currentTrack.album}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowVisualizer(!showVisualizer)}
            title="Real-Time FFT Analyzer"
            className={`p-2 rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ${
              showVisualizer ? 'bg-amber-400/20 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={onShowDetails}
            title="Stream Inspector"
            className="p-2 rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQueue}
            title="Queue"
            className="p-2 rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Album Artwork (Touch Swipable) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="my-auto flex flex-col items-center justify-center py-2 relative"
      >
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black border border-white/[0.08] bg-[#12141a]">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Direct Bit-Perfect Badge */}
          {settings.isBitPerfect && (
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-400/30 text-[10px] font-mono text-amber-400 flex items-center gap-1 shadow-lg">
              <Zap className="w-3 h-3 fill-amber-400" />
              <span>Direct Hi-Res</span>
            </div>
          )}

          {/* Swipe hint */}
          <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 bg-black/40 px-2 py-0.5 rounded-full">
              Swipe to change track
            </span>
          </div>
        </div>
      </div>

      {/* Track Title & Artist */}
      <div className="space-y-2 shrink-0 text-center">
        <h2 className="text-lg sm:text-xl font-bold text-slate-100 truncate tracking-tight">
          {currentTrack.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 truncate">
          {currentTrack.artist}
        </p>

        {/* Technical Specification Ribbon */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12141a] border border-white/[0.06] text-[11px] font-mono mx-auto">
          <span className="text-amber-400 font-bold">{currentTrack.format}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-200 tabular-nums">
            {currentTrack.bitDepth}b / {formatSampleRate(currentTrack.sampleRate)}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 tabular-nums">
            {formatBitrate(currentTrack.bitrate)}
          </span>
        </div>
      </div>

      {/* Optional Real-Time FFT Visualizer */}
      {showVisualizer && (
        <div className="my-2 shrink-0">
          <VisualizerCanvas height={60} />
        </div>
      )}

      {/* Scrubber & Timestamps */}
      <div className="space-y-1.5 mt-2 shrink-0">
        <div className="relative group py-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={displayTime}
            onChange={(e) => {
              setIsSeeking(true);
              setSeekTime(parseFloat(e.target.value));
            }}
            onMouseUp={() => {
              setIsSeeking(false);
              onSeek(seekTime);
            }}
            onTouchEnd={() => {
              setIsSeeking(false);
              onSeek(seekTime);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-amber-400"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400 tabular-nums">
          <span>{formatTime(displayTime)}</span>
          <span>-{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Android Transport Controls */}
      <div className="flex items-center justify-between py-2 shrink-0">
        {/* Shuffle */}
        <button
          onClick={onToggleShuffle}
          className={`p-3 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors active:scale-90 ${
            isShuffle ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrevious}
          className="p-3 rounded-full text-slate-200 hover:text-white active:scale-90 transition-transform min-h-[48px] min-w-[48px] flex items-center justify-center"
          title="Previous Track"
        >
          <SkipBack className="w-7 h-7 fill-current" />
        </button>

        {/* Play / Pause - Android Primary 64px Anchor */}
        <button
          onClick={onTogglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 active:scale-95 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-400/20 transition-transform"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-slate-950" />
          ) : (
            <Play className="w-7 h-7 fill-slate-950 ml-1" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="p-3 rounded-full text-slate-200 hover:text-white active:scale-90 transition-transform min-h-[48px] min-w-[48px] flex items-center justify-center"
          title="Next Track"
        >
          <SkipForward className="w-7 h-7 fill-current" />
        </button>

        {/* Repeat */}
        <button
          onClick={onToggleRepeat}
          className={`p-3 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors active:scale-90 ${
            repeatMode !== 'off' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-5 h-5" />
          ) : (
            <Repeat className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Bottom Toolstrip: Volume, Gapless Status, EQ */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06] shrink-0">
        {/* Volume Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-[160px]">
          <button
            onClick={() => onSetVolume(settings.volume > 0 ? 0 : 0.85)}
            className="text-slate-400 hover:text-white"
          >
            {settings.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.volume}
            onChange={(e) => onSetVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg accent-amber-400"
          />
        </div>

        {/* Gapless Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const nextMode: GaplessMode =
                settings.gaplessMode === 'pure'
                  ? 'micro'
                  : settings.gaplessMode === 'micro'
                  ? 'crossfade'
                  : 'pure';
              onSetGaplessMode(nextMode);
            }}
            className="text-[10px] font-mono px-2 py-1 rounded-full bg-[#12141a] border border-white/[0.08] hover:border-amber-400/40 text-slate-300 transition-colors uppercase"
          >
            Gapless: <span className="text-amber-400 font-bold">{settings.gaplessMode}</span>
          </button>

          <button
            onClick={onOpenEQ}
            className="p-2 rounded-full bg-[#12141a] border border-white/[0.08] text-slate-300 hover:text-amber-400 transition-colors"
            title="Equalizer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
