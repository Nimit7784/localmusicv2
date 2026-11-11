/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const padSec = secs < 10 ? `0${secs}` : `${secs}`;
  const padMin = mins < 10 ? `0${mins}` : `${mins}`;
  return `${padMin}:${padSec}`;
}

export function formatSampleRate(rateHz: number): string {
  if (!rateHz) return '44.1 kHz';
  const khz = rateHz / 1000;
  return Number.isInteger(khz) ? `${khz.toFixed(1)} kHz` : `${khz.toFixed(1)} kHz`;
}

export function formatBitrate(kbps?: number): string {
  if (!kbps) return 'Lossless';
  return `${kbps.toLocaleString()} kbps`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
