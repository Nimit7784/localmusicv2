/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sliders,
  ListMusic,
  Info,
  Disc3,
  Activity,
  Zap,
} from 'lucide-react';
import { AudioEngineSettings, AudioTrack, GaplessMode } from '../types/audio';
import { formatBitrate, formatSampleRate, formatTime } from '../utils/formatters';
import { VisualizerCanvas } from './VisualizerCanvas';

interface NowPlayingSheetProps {
  isOpen: boolean;
  onClose: () => void;
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

export const NowPlayingSheet: React.FC<NowPlayingSheetProps> = ({
  isOpen,
  onClose,
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
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [showGaplessConfig, setShowGaplessConfig] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);

  if (!isOpen || !currentTrack) return null;

  const displayTime = isSeeking ? seekTime : currentTime;
  const remainingTime = Math.max(0, duration - displayTime);
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Player Sheet */}
      <div className="relative w-full max-w-2xl mx-auto h-[95vh] md:h-[90vh] bg-[#0b0e14] border-t border-slate-800 md:rounded-t-3xl shadow-2xl flex flex-col overflow-y-auto no-scrollbar">
        
        {/* Android drag handle affordance */}
        <div
          onClick={onClose}
          className="w-full py-2.5 flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="w-12 h-1.5 bg-slate-700/80 rounded-full group-hover:bg-slate-500 transition-colors" />
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-2 shrink-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Collapse Player"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center min-w-0 px-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
              Playing From
            </span>
            <p className="text-xs font-medium text-slate-300 truncate max-w-[200px]">
              {currentTrack.album}
            </p>
          </div>

          <div className="flex items-center gap-1 -mr-2">
            <button
              onClick={onShowDetails}
              className="p-2 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Track Technical Analysis"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenQueue}
              className="p-2 rounded-full text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Current Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player Body Content */}
        <div className="flex-1 px-6 md:px-10 flex flex-col justify-between py-2">
          
          {/* Album Artwork with subtle vinyl record layer */}
          <div className="relative my-auto flex items-center justify-center py-2">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800/80 group">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-[1.02]' : 'scale-100'
                }`}
              />
              
              {/* Vinyl center reflection texture */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5 pointer-events-none" />

              {/* Bit-Perfect Direct Stream Badge (unboxed text) */}
              {settings.isBitPerfect && (
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-amber-400/30 text-[10px] font-mono text-amber-400 flex items-center gap-1.5 shadow-lg">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  <span>Bit-Perfect Direct</span>
                </div>
              )}
            </div>
          </div>

          {/* Track Titles & Audiophile Specs Strip */}
          <div className="space-y-3 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-100 truncate tracking-tight">
                  {currentTrack.title}
                </h2>
                <p className="text-sm md:text-base text-slate-400 truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Visualizer Toggle */}
              <button
                onClick={() => setShowVisualizer(!showVisualizer)}
                title="Toggle Real-time Spectrum Visualizer"
                className={`p-2 rounded-lg border transition-colors shrink-0 ${
                  showVisualizer
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>

            {/* Audiophile Technical Spec Strip (Clean unboxed layout) */}
            <div className="p-2.5 rounded-xl bg-[#121620] border border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-amber-400 font-semibold">{currentTrack.format}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-200 tabular-nums">
                  {currentTrack.bitDepth}-Bit / {formatSampleRate(currentTrack.sampleRate)}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 tabular-nums hidden sm:inline">
                  {formatBitrate(currentTrack.bitrate)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowGaplessConfig(!showGaplessConfig)}
                  className="text-[11px] font-sans px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors uppercase tracking-wider"
                >
                  {settings.gaplessMode === 'pure' ? 'Pure Gapless' : settings.gaplessMode === 'micro' ? 'Micro-Fade' : 'Crossfade'}
                </button>
              </div>
            </div>

            {/* Gapless mode popout switcher */}
            {showGaplessConfig && (
              <div className="p-3 rounded-xl bg-[#161c28] border border-slate-700/80 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">Gapless Audio Engine Mode</span>
                  <span className="text-[10px] text-slate-400">Zero silence between songs</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onSetGaplessMode('pure')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                      settings.gaplessMode === 'pure'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pure Gapless (0ms)
                  </button>
                  <button
                    onClick={() => onSetGaplessMode('micro')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                      settings.gaplessMode === 'micro'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Micro-Fade (35ms)
                  </button>
                  <button
                    onClick={() => onSetGaplessMode('crossfade')}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-colors text-center ${
                      settings.gaplessMode === 'crossfade'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Crossfade (2.0s)
                  </button>
                </div>
              </div>
            )}

            {/* Live 60fps Visualizer */}
            {showVisualizer && <VisualizerCanvas height={65} />}
          </div>

          {/* Scrubber & Timers */}
          <div className="space-y-1.5 mt-2">
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

          {/* Ergonomic Transport Controls */}
          <div className="flex items-center justify-between py-2">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              className={`p-3 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors ${
                isShuffle ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Previous */}
            <button
              onClick={onPrevious}
              className="p-3 rounded-full text-slate-200 hover:text-white active:scale-95 transition-transform min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Previous Track"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            {/* Play / Pause - Prominent 64px anchor */}
            <button
              onClick={onTogglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/25 transition-transform"
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
              className="p-3 rounded-full text-slate-200 hover:text-white active:scale-95 transition-transform min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Next Track"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={onToggleRepeat}
              className={`p-3 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors ${
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

          {/* Bottom Toolstrip: Volume, Bit-Perfect Bypass, EQ Trigger */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            {/* Volume */}
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
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

            {/* Bit-Perfect & EQ Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleBitPerfect}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  settings.isBitPerfect
                    ? 'bg-amber-400/10 border-amber-400 text-amber-400 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Direct Bit-Perfect Mode (Bypasses EQ/DSP)"
              >
                Bit-Perfect
              </button>

              <button
                onClick={onOpenEQ}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141824] border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 hover:text-amber-400 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>EQ</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
