/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  FastForward,
  Rewind,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Quote,
  Airplay,
  ListMusic,
  MoreHorizontal,
  Heart,
  Sliders,
} from 'lucide-react';
import { AudioEngineSettings, AudioTrack, GaplessMode, SleepTimerState } from '../types/audio';
import { formatTime } from '../utils/formatters';
import { AppleAudioQualitySheet } from './AppleAudioQualitySheet';
import { Moon, Settings } from 'lucide-react';

interface AppleNowPlayingProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
  settings: AudioEngineSettings;
  sleepTimerState?: SleepTimerState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onSetVolume: (vol: number) => void;
  onSetGaplessMode: (mode: GaplessMode) => void;
  onOpenEQ: () => void;
  onOpenQueue: () => void;
  onOpenSettings?: () => void;
}

export const AppleNowPlaying: React.FC<AppleNowPlayingProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  settings,
  sleepTimerState,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onToggleRepeat,
  onToggleShuffle,
  onSetVolume,
  onSetGaplessMode,
  onOpenEQ,
  onOpenQueue,
  onOpenSettings,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQualitySheet, setShowQualitySheet] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);

  if (!isOpen || !currentTrack) return null;

  const displayTime = isSeeking ? seekTime : currentTime;
  const remainingTime = Math.max(0, duration - displayTime);
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  // Real-time lyrics lines for Apple Music Sing / Lyrics mode
  const lyricsLines = [
    { time: 0, text: "High-fidelity acoustic vibrations fill the room" },
    { time: 6, text: "Every harmonic resonates in pure lossless clarity" },
    { time: 14, text: "Analog warmth flowing through the studio monitors" },
    { time: 22, text: "Seamless bit-perfect gapless audio in your hands" },
    { time: 30, text: "Sub-bass frequencies pulsing in 24-bit precision" },
    { time: 38, text: "No compression artifacts, only genuine sound" },
    { time: 46, text: "The music plays on without a single millisecond lost" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/85 backdrop-blur-2xl animate-in slide-in-from-bottom duration-300 select-none">
      
      {/* Background click to collapse */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Apple Music Player Lucid Glass Sheet */}
      <div className="relative w-full max-w-md mx-auto h-[95vh] md:h-[90vh] bg-[#14131a]/70 backdrop-blur-3xl rounded-t-[40px] shadow-[0_-15px_60px_rgba(0,0,0,0.9),_inset_0_1px_1px_rgba(255,255,255,0.3)] border-t border-white/[0.25] flex flex-col overflow-hidden">
        
        {/* Dynamic Lucid Chromatic Light Orbs behind the frosted glass */}
        <div className="absolute -top-20 -left-16 w-80 h-80 bg-[#fa2d48]/30 rounded-full blur-[80px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#9c27b0]/25 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-[#00bcd4]/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Apple Music Pull-Down Grab Handle */}
        <div
          onClick={onClose}
          className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-pointer shrink-0 group z-10"
        >
          <div className="w-10 h-1 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        </div>

        {/* Player Header */}
        <div className="flex items-center justify-between px-6 py-1 shrink-0 z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/70 hover:text-white"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* Center Title or Active Sleep Timer Capsule */}
          {sleepTimerState?.active ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill border border-violet-500/50 bg-violet-500/20 text-violet-200 text-[11px] font-mono font-semibold animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.35)] hover:scale-105 transition-all"
              title="Sleep Timer Active - Click to Manage"
            >
              <Moon className="w-3 h-3 text-violet-300" />
              <span>
                {sleepTimerState.mode === 'track_end'
                  ? 'End of Track'
                  : formatTime(sleepTimerState.remainingSeconds)}
              </span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              Hi-Res Lossless
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={`w-8 h-8 rounded-full glass-pill flex items-center justify-center transition-all ${
                  sleepTimerState?.active
                    ? 'text-violet-400 border-violet-400/50 bg-violet-500/20'
                    : 'text-white/70 hover:text-white'
                }`}
                title="Settings & Sleep Timer"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onOpenEQ}
              className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/70 hover:text-white"
              title="Equalizer & Audio DSP"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 px-7 flex flex-col justify-between py-3 z-10 overflow-y-auto no-scrollbar">
          
          {showLyrics ? (
            /* Apple Music Live Synced Lyrics View */
            <div className="flex-1 flex flex-col justify-center space-y-6 py-6 overflow-y-auto no-scrollbar">
              <div className="text-left space-y-5">
                {lyricsLines.map((line, idx) => {
                  const isCurrentLine = displayTime >= line.time && (idx === lyricsLines.length - 1 || displayTime < lyricsLines[idx + 1].time);
                  return (
                    <p
                      key={idx}
                      onClick={() => onSeek(line.time)}
                      className={`text-xl font-bold tracking-tight transition-all duration-300 cursor-pointer ${
                        isCurrentLine
                          ? 'text-white scale-105 origin-left drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Standard Apple Music Album Artwork View */
            <div className="my-auto flex flex-col items-center justify-center py-2">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/[0.1]">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Song Title, Artist & Lossless Badge */}
          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white truncate tracking-tight">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-medium text-[#98989d] truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite ? 'text-[#fa2d48]' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#fa2d48]' : ''}`} />
                </button>
                <button
                  onClick={onOpenQueue}
                  className="p-2 rounded-full text-white/40 hover:text-white"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Signature Apple Music Lossless Badge */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowQualitySheet(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/[0.08] text-[10px] font-mono font-medium text-white/80 active:scale-95 transition-all"
              >
                <span className="font-bold text-white">
                  {currentTrack.isHiRes ? 'Hi-Res Lossless' : 'Lossless'}
                </span>
                <span className="text-white/40">·</span>
                <span className="text-white/60">
                  {currentTrack.bitDepth}b/{currentTrack.sampleRate >= 88200 ? '96kHz' : '48kHz'}
                </span>
              </button>

              <button
                onClick={() => {
                  const next: GaplessMode = settings.gaplessMode === 'pure' ? 'micro' : 'pure';
                  onSetGaplessMode(next);
                }}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60 hover:text-white uppercase"
              >
                Gapless: {settings.gaplessMode}
              </button>
            </div>
          </div>

          {/* Apple Music Scrubber */}
          <div className="space-y-1 mt-2 shrink-0">
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
                className="w-full h-1 bg-white/20 rounded-full cursor-pointer accent-white"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#8e8e93] tabular-nums">
              <span>{formatTime(displayTime)}</span>
              <span>-{formatTime(remainingTime)}</span>
            </div>
          </div>

          {/* Apple Music Transport Controls */}
          <div className="flex items-center justify-between py-2 shrink-0">
            <button
              onClick={onToggleShuffle}
              className={`p-3 rounded-full transition-colors active:scale-90 ${
                isShuffle ? 'text-[#fa2d48]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={onPrevious}
              className="p-3 text-white active:scale-90 transition-transform"
            >
              <Rewind className="w-8 h-8 fill-white" />
            </button>

            {/* Center Apple Play Button */}
            <button
              onClick={onTogglePlay}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-11 h-11 fill-white" />
              ) : (
                <Play className="w-11 h-11 fill-white ml-1" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-3 text-white active:scale-90 transition-transform"
            >
              <FastForward className="w-8 h-8 fill-white" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-3 rounded-full transition-colors active:scale-90 ${
                repeatMode !== 'off' ? 'text-[#fa2d48]' : 'text-white/40 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 px-2 py-1 shrink-0">
            <VolumeX className="w-4 h-4 text-white/40" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.volume}
              onChange={(e) => onSetVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full accent-white"
            />
            <Volume2 className="w-4 h-4 text-white/40" />
          </div>

          {/* Apple Music Bottom Action Trio: [Lyrics] - [AirPlay] - [Queue] */}
          <div className="flex items-center justify-around pt-3 border-t border-white/[0.08] shrink-0">
            {/* Live Lyrics Button */}
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                showLyrics ? 'text-[#fa2d48] bg-white/10' : 'text-white/50 hover:text-white'
              }`}
              title="Time-Synced Lyrics"
            >
              <Quote className="w-5 h-5" />
            </button>

            {/* Output Routing */}
            <button
              onClick={() => setShowQualitySheet(true)}
              className="p-2.5 rounded-full text-white/50 hover:text-white active:scale-90 transition-all"
              title="Audio Output / DAC"
            >
              <Airplay className="w-5 h-5" />
            </button>

            {/* Up Next Queue */}
            <button
              onClick={onOpenQueue}
              className="p-2.5 rounded-full text-white/50 hover:text-white active:scale-90 transition-all"
              title="Up Next"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Audio Quality Sheet */}
      <AppleAudioQualitySheet
        track={currentTrack}
        isOpen={showQualitySheet}
        onClose={() => setShowQualitySheet(false)}
      />

    </div>
  );
};
