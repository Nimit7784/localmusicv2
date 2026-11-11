/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AudioFormat = 'FLAC' | 'WAV' | 'AIFF' | 'ALAC' | 'AAC' | 'MP3' | 'OGG' | 'OPUS';

export type GaplessMode = 'pure' | 'micro' | 'crossfade';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  duration: number; // in seconds
  format: AudioFormat;
  bitDepth: number; // e.g. 16, 24, 32
  sampleRate: number; // e.g. 44100, 48000, 88200, 96000, 192000
  bitrate?: number; // kbps
  channels: number; // 1 or 2
  isHiRes: boolean; // 24-bit+ or >=88.2kHz or lossless
  fileSize: number; // in bytes
  fileName: string;
  folderPath?: string; // e.g. "/storage/emulated/0/Music"
  coverUrl?: string;
  blob?: Blob;
  blobKey?: string;
  dateAdded: number;
  isBuiltInDemo?: boolean;
}

export interface EQBandConfig {
  frequency: number;
  label: string;
  gain: number; // -12dB to +12dB
}

export interface EQPreset {
  id: string;
  name: string;
  description: string;
  gains: number[]; // 10 values corresponding to the 10 bands
}

export interface AudioEngineSettings {
  gaplessMode: GaplessMode;
  crossfadeDuration: number; // in seconds (0.1 to 10)
  volume: number; // 0 to 1
  preampGain: number; // in dB (-12 to +12)
  isBitPerfect: boolean; // bypasses DSP/EQ for direct stream
  currentPresetId: string;
  customBandGains: number[];
  screenWakeLock: boolean;
}

export type SleepTimerMode = 'off' | 'duration' | 'track_end';

export interface SleepTimerState {
  mode: SleepTimerMode;
  remainingSeconds: number;
  totalDurationSeconds: number;
  active: boolean;
}

