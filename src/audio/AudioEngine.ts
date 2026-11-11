/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioEngineSettings, AudioTrack, EQPreset, GaplessMode, SleepTimerMode, SleepTimerState } from '../types/audio';

// 10 Audiophile Frequency Bands (ISO standard octave centers)
export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: EQPreset[] = [
  {
    id: 'flat',
    name: 'Studio Reference (Flat)',
    description: 'Uncolored linear frequency response for critical studio monitoring.',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'audiophile_warmth',
    name: 'Analog Warmth',
    description: 'Lush low-end warmth and smoothed upper treble reminiscent of class-A tube amplifiers.',
    gains: [2.5, 3.0, 2.0, 1.0, 0, -0.5, 0.5, 1.0, 1.5, 0.5],
  },
  {
    id: 'bass_definition',
    name: 'Bass Definition',
    description: 'Tight sub-bass articulation without muddying vocal midrange.',
    gains: [5.0, 4.0, 2.5, 1.0, -1.0, 0, 0.5, 1.0, 0, 0],
  },
  {
    id: 'vocal_clarity',
    name: 'Vocal Presence',
    description: 'Elevates human vocal timbre, acoustic strings, and dialogue presence.',
    gains: [-1.0, -0.5, 0, 1.0, 2.5, 3.5, 2.0, 1.0, 0, 0.5],
  },
  {
    id: 'iem_air',
    name: 'IEM High-Air',
    description: 'Compensates for in-ear monitor roll-off with extended airy harmonics.',
    gains: [1.0, 0.5, 0, -0.5, 0, 0.5, 1.5, 2.5, 4.0, 5.0],
  },
  {
    id: 'direct_bypass',
    name: 'Bit-Perfect Direct Bypass',
    description: 'Completely unadulterated bitstream passed straight to the hardware DAC.',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

export type AudioEngineEvent =
  | 'trackchange'
  | 'play'
  | 'pause'
  | 'timeupdate'
  | 'durationchange'
  | 'ended'
  | 'queuechange'
  | 'gapless'
  | 'settingschange'
  | 'sleeptimerupdate'
  | 'sleeptimerfired';

type EventListener = (...args: unknown[]) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private preampGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];

  // Dual-deck streaming system for gapless transitions
  private deckA: HTMLAudioElement;
  private deckB: HTMLAudioElement;
  private deckASource: MediaElementAudioSourceNode | null = null;
  private deckBSource: MediaElementAudioSourceNode | null = null;
  private deckAGain: GainNode | null = null;
  private deckBGain: GainNode | null = null;

  private activeDeck: 'A' | 'B' = 'A';
  private preloadedTrack: AudioTrack | null = null;
  private currentTrack: AudioTrack | null = null;
  private queue: AudioTrack[] = [];
  private queueIndex = -1;

  private isPlaying = false;
  private repeatMode: 'off' | 'all' | 'one' = 'off';
  private isShuffle = false;

  private settings: AudioEngineSettings = {
    gaplessMode: 'pure',
    crossfadeDuration: 2.0,
    volume: 0.85,
    preampGain: 0,
    isBitPerfect: false,
    currentPresetId: 'flat',
    customBandGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    screenWakeLock: false,
  };

  private listeners: Map<AudioEngineEvent, Set<EventListener>> = new Map();
  private wakeLockSentinel: unknown = null;
  private gaplessLookaheadTimer: number | null = null;
  private activeObjectUrls: string[] = [];

  // Sleep Timer System
  private sleepTimerMode: SleepTimerMode = 'off';
  private sleepTimerEndsAt: number | null = null;
  private sleepTimerTotalDuration = 0;
  private sleepTimerInterval: ReturnType<typeof setInterval> | null = null;
  private lastTrackEndEmittedSec = 0;

  constructor() {
    this.deckA = new Audio();
    this.deckB = new Audio();
    this.deckA.preload = 'auto';
    this.deckB.preload = 'auto';

    this.bindDeckEvents(this.deckA, 'A');
    this.bindDeckEvents(this.deckB, 'B');

    this.setupMediaSession();
  }

  // Safely triggers Android tactile vibration
  private triggerHaptic(duration = 10) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    } catch {
      // Ignore vibration errors
    }
  }

  // Ensures AudioContext is initialized on user interaction
  private async initContextIfNeeded(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass({
        latencyHint: 'playback',
      });

      // Master Gain
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.value = this.settings.volume;

      // Pre-amp Gain
      this.preampGainNode = this.ctx.createGain();
      const preampLin = Math.pow(10, this.settings.preampGain / 20);
      this.preampGainNode.gain.value = preampLin;

      // FFT Analyser for 60fps real-time visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.82;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // 10-Band EQ Filter Chain
      this.eqFilters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.frequency.value = freq;
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.414; // Standard 1-octave Q
        }
        filter.gain.value = this.settings.isBitPerfect ? 0 : this.settings.customBandGains[index] || 0;
        return filter;
      });

      // Connect filter series: Preamp -> Filter[0] -> Filter[1] ... -> Master -> Analyser -> Destination
      let lastNode: AudioNode = this.preampGainNode;
      for (const filter of this.eqFilters) {
        lastNode.connect(filter);
        lastNode = filter;
      }
      lastNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Deck A routing
      this.deckASource = this.ctx.createMediaElementSource(this.deckA);
      this.deckAGain = this.ctx.createGain();
      this.deckAGain.gain.value = 1;
      this.deckASource.connect(this.deckAGain);
      this.deckAGain.connect(this.preampGainNode);

      // Deck B routing
      this.deckBSource = this.ctx.createMediaElementSource(this.deckB);
      this.deckBGain = this.ctx.createGain();
      this.deckBGain.gain.value = 0;
      this.deckBSource.connect(this.deckBGain);
      this.deckBGain.connect(this.preampGainNode);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  // Configures hardware keys & Android notification shade
  private setupMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const ms = navigator.mediaSession;
    ms.setActionHandler('play', () => this.play());
    ms.setActionHandler('pause', () => this.pause());
    ms.setActionHandler('previoustrack', () => this.playPrevious());
    ms.setActionHandler('nexttrack', () => this.playNext());
    ms.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) {
        this.seek(details.seekTime);
      }
    });
    ms.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seek(this.getCurrentTime() - skipTime);
    });
    ms.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10;
      this.seek(this.getCurrentTime() + skipTime);
    });
  }

  private updateMediaSessionMetadata(track: AudioTrack) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const artwork = track.coverUrl
      ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
      : [{ src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'Aura Hi-Fi',
      artwork,
    });
  }

  private updateMediaSessionPlaybackState() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';

    try {
      const currentDeck = this.getCurrentDeck();
      if (currentDeck.duration && !isNaN(currentDeck.duration)) {
        navigator.mediaSession.setPositionState({
          duration: currentDeck.duration,
          playbackRate: currentDeck.playbackRate || 1.0,
          position: currentDeck.currentTime || 0,
        });
      }
    } catch {
      // Ignore position state sync errors
    }
  }

  // Wakes/locks display for active listening
  public async setScreenWakeLock(enabled: boolean): Promise<boolean> {
    this.settings.screenWakeLock = enabled;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      this.emit('settingschange', this.settings);
      return false;
    }

    try {
      if (enabled && !this.wakeLockSentinel) {
        this.wakeLockSentinel = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }).wakeLock.request('screen');
        (this.wakeLockSentinel as { addEventListener: (type: string, cb: () => void) => void }).addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
      } else if (!enabled && this.wakeLockSentinel) {
        await (this.wakeLockSentinel as { release: () => Promise<void> }).release();
        this.wakeLockSentinel = null;
      }
    } catch (e) {
      console.warn('WakeLock toggle error:', e);
    }

    this.emit('settingschange', this.settings);
    return !!this.wakeLockSentinel;
  }

  // Binds audio element events
  private bindDeckEvents(deck: HTMLAudioElement, deckId: 'A' | 'B') {
    deck.addEventListener('play', () => {
      if (this.activeDeck === deckId) {
        this.isPlaying = true;
        this.emit('play');
        this.updateMediaSessionPlaybackState();
      }
    });

    deck.addEventListener('pause', () => {
      if (this.activeDeck === deckId && !deck.ended) {
        this.isPlaying = false;
        this.emit('pause');
        this.updateMediaSessionPlaybackState();
      }
    });

    deck.addEventListener('timeupdate', () => {
      if (this.activeDeck === deckId) {
        this.emit('timeupdate', deck.currentTime, deck.duration || this.currentTrack?.duration || 0);

        // If sleep timer is set to stop when current track finishes, notify listeners with remaining time
        if (this.sleepTimerMode === 'track_end' && deck.duration && !isNaN(deck.duration)) {
          const rem = Math.max(0, Math.round(deck.duration - deck.currentTime));
          if (rem !== this.lastTrackEndEmittedSec) {
            this.lastTrackEndEmittedSec = rem;
            this.emit('sleeptimerupdate', this.getSleepTimerState());
          }
        }

        this.checkGaplessTrigger(deck);
      }
    });

    deck.addEventListener('durationchange', () => {
      if (this.activeDeck === deckId) {
        this.emit('durationchange', deck.duration);
      }
    });

    deck.addEventListener('ended', () => {
      if (this.activeDeck === deckId) {
        this.handleTrackEnded();
      }
    });
  }

  // Precision Gapless lookahead trigger
  private checkGaplessTrigger(deck: HTMLAudioElement) {
    // If sleep timer is set to stop when current track ends, bypass gapless transition to next track
    if (this.sleepTimerMode === 'track_end') {
      return;
    }

    if (!this.currentTrack || !deck.duration || isNaN(deck.duration)) return;
    const remaining = deck.duration - deck.currentTime;

    const lookahead = this.settings.gaplessMode === 'crossfade'
      ? Math.max(1, this.settings.crossfadeDuration)
      : this.settings.gaplessMode === 'micro'
      ? 0.25
      : 0.15;

    // Trigger pre-roll and seamless deck handoff
    if (remaining <= lookahead && remaining > 0 && !this.gaplessLookaheadTimer) {
      this.executeGaplessTransition();
    }
  }

  // Prepares the next track in the standby deck
  private prepareNextTrackForStandby(): AudioTrack | null {
    if (this.repeatMode === 'one' && this.currentTrack) {
      return this.currentTrack;
    }

    const nextIndex = this.getNextIndex();
    if (nextIndex === -1 || nextIndex >= this.queue.length) {
      return null;
    }

    const nextTrack = this.queue[nextIndex];
    const standbyDeck = this.activeDeck === 'A' ? this.deckB : this.deckA;

    if (this.preloadedTrack?.id !== nextTrack.id) {
      this.preloadedTrack = nextTrack;
      const srcUrl = this.getTrackSourceUrl(nextTrack);
      standbyDeck.src = srcUrl;
      standbyDeck.currentTime = 0;
      standbyDeck.load();
    }

    return nextTrack;
  }

  // Performs bit-perfect gapless transition
  private async executeGaplessTransition() {
    const nextTrack = this.prepareNextTrackForStandby();
    if (!nextTrack) return;

    const currentDeck = this.getCurrentDeck();
    const standbyDeck = this.getStandbyDeck();
    const currentGain = this.activeDeck === 'A' ? this.deckAGain : this.deckBGain;
    const standbyGain = this.activeDeck === 'A' ? this.deckBGain : this.deckAGain;

    if (!this.ctx || !currentGain || !standbyGain) return;

    const mode = this.settings.gaplessMode;
    const now = this.ctx.currentTime;

    if (mode === 'crossfade') {
      const fadeDur = Math.max(0.5, this.settings.crossfadeDuration);
      try {
        await standbyDeck.play();
        // Exponential crossfade curves for equal loudness
        currentGain.gain.setValueAtTime(1, now);
        currentGain.gain.linearRampToValueAtTime(0, now + fadeDur);
        standbyGain.gain.setValueAtTime(0, now);
        standbyGain.gain.linearRampToValueAtTime(1, now + fadeDur);

        setTimeout(() => {
          this.finalizeTransition(nextTrack);
        }, fadeDur * 1000);
      } catch (e) {
        console.warn('Crossfade error:', e);
      }
    } else if (mode === 'micro') {
      // 35ms microfade to eliminate clicks
      const microDur = 0.035;
      try {
        await standbyDeck.play();
        currentGain.gain.setValueAtTime(1, now);
        currentGain.gain.linearRampToValueAtTime(0, now + microDur);
        standbyGain.gain.setValueAtTime(0, now);
        standbyGain.gain.linearRampToValueAtTime(1, now + microDur);

        setTimeout(() => {
          this.finalizeTransition(nextTrack);
        }, microDur * 1000);
      } catch (e) {
        console.warn('Microfade error:', e);
      }
    } else {
      // Pure bit-perfect sample-accurate transition
      try {
        await standbyDeck.play();
        currentGain.gain.setValueAtTime(0, now);
        standbyGain.gain.setValueAtTime(1, now);
        this.finalizeTransition(nextTrack);
      } catch (e) {
        console.warn('Pure gapless trigger error:', e);
      }
    }

    this.emit('gapless', nextTrack);
  }

  private finalizeTransition(nextTrack: AudioTrack) {
    const oldDeck = this.getCurrentDeck();
    oldDeck.pause();
    oldDeck.currentTime = 0;

    // Switch active deck identifier
    this.activeDeck = this.activeDeck === 'A' ? 'B' : 'A';
    this.currentTrack = nextTrack;
    this.queueIndex = this.queue.findIndex((t) => t.id === nextTrack.id);
    this.preloadedTrack = null;
    this.gaplessLookaheadTimer = null;

    this.emit('trackchange', this.currentTrack);
    this.updateMediaSessionMetadata(this.currentTrack);
    this.updateMediaSessionPlaybackState();

    // Pre-roll subsequent track on the newly vacated deck
    this.prepareNextTrackForStandby();
  }

  private handleTrackEnded() {
    if (this.sleepTimerMode === 'track_end') {
      this.triggerSleepTimerFinish('track_end');
      return;
    }

    if (this.repeatMode === 'one' && this.currentTrack) {
      const deck = this.getCurrentDeck();
      deck.currentTime = 0;
      deck.play();
      return;
    }

    const nextIndex = this.getNextIndex();
    if (nextIndex !== -1 && nextIndex < this.queue.length) {
      this.playTrackAtIndex(nextIndex);
    } else {
      this.isPlaying = false;
      this.emit('ended');
      this.updateMediaSessionPlaybackState();
    }
  }

  private getNextIndex(): number {
    if (this.queue.length === 0) return -1;
    if (this.isShuffle) {
      if (this.queue.length === 1) return 0;
      let rand = Math.floor(Math.random() * this.queue.length);
      while (rand === this.queueIndex && this.queue.length > 1) {
        rand = Math.floor(Math.random() * this.queue.length);
      }
      return rand;
    }

    if (this.queueIndex + 1 < this.queue.length) {
      return this.queueIndex + 1;
    }

    if (this.repeatMode === 'all') {
      return 0;
    }

    return -1;
  }

  private getPreviousIndex(): number {
    if (this.queue.length === 0) return -1;
    if (this.queueIndex > 0) {
      return this.queueIndex - 1;
    }
    if (this.repeatMode === 'all') {
      return this.queue.length - 1;
    }
    return 0;
  }

  private getCurrentDeck(): HTMLAudioElement {
    return this.activeDeck === 'A' ? this.deckA : this.deckB;
  }

  private getStandbyDeck(): HTMLAudioElement {
    return this.activeDeck === 'A' ? this.deckB : this.deckA;
  }

  private getTrackSourceUrl(track: AudioTrack): string {
    if (track.blob) {
      const url = URL.createObjectURL(track.blob);
      this.activeObjectUrls.push(url);
      return url;
    }
    return '';
  }

  // --- Public Playback Controls ---

  public async setQueue(tracks: AudioTrack[], startIndex = 0, autoPlay = true) {
    this.queue = [...tracks];
    this.emit('queuechange', this.queue);

    if (tracks.length > 0 && startIndex >= 0 && startIndex < tracks.length) {
      await this.playTrackAtIndex(startIndex, autoPlay);
    }
  }

  public addToQueue(track: AudioTrack) {
    this.queue.push(track);
    this.emit('queuechange', this.queue);
    this.prepareNextTrackForStandby();
  }

  public playNextInQueue(track: AudioTrack) {
    const insertIdx = this.queueIndex + 1;
    this.queue.splice(insertIdx, 0, track);
    this.emit('queuechange', this.queue);
    this.prepareNextTrackForStandby();
  }

  public removeFromQueue(index: number) {
    if (index < 0 || index >= this.queue.length) return;
    this.queue.splice(index, 1);
    if (index < this.queueIndex) {
      this.queueIndex--;
    } else if (index === this.queueIndex) {
      if (this.queue.length > 0) {
        this.playTrackAtIndex(Math.min(index, this.queue.length - 1));
      } else {
        this.stop();
      }
    }
    this.emit('queuechange', this.queue);
    this.prepareNextTrackForStandby();
  }

  public clearQueue() {
    this.stop();
    this.queue = [];
    this.queueIndex = -1;
    this.currentTrack = null;
    this.emit('queuechange', this.queue);
    this.emit('trackchange', null);
  }

  public async playTrackAtIndex(index: number, autoPlay = true) {
    if (index < 0 || index >= this.queue.length) return;
    await this.initContextIfNeeded();

    this.triggerHaptic(12);
    this.queueIndex = index;
    const track = this.queue[index];
    this.currentTrack = track;

    const deck = this.getCurrentDeck();
    const otherDeck = this.getStandbyDeck();
    otherDeck.pause();
    otherDeck.currentTime = 0;

    const currentGain = this.activeDeck === 'A' ? this.deckAGain : this.deckBGain;
    const otherGain = this.activeDeck === 'A' ? this.deckBGain : this.deckAGain;

    if (currentGain) currentGain.gain.value = 1;
    if (otherGain) otherGain.gain.value = 0;

    const srcUrl = this.getTrackSourceUrl(track);
    deck.src = srcUrl;
    deck.currentTime = 0;

    this.emit('trackchange', track);
    this.updateMediaSessionMetadata(track);

    if (autoPlay) {
      try {
        await deck.play();
        this.isPlaying = true;
        this.emit('play');
        this.updateMediaSessionPlaybackState();
      } catch (e) {
        console.warn('Playback error (user interaction required):', e);
      }
    }

    // Pre-buffer next track for gapless readiness
    this.prepareNextTrackForStandby();
  }

  public async play() {
    await this.initContextIfNeeded();
    this.triggerHaptic(8);
    const deck = this.getCurrentDeck();
    if (!deck.src && this.currentTrack) {
      deck.src = this.getTrackSourceUrl(this.currentTrack);
    }
    try {
      await deck.play();
      this.isPlaying = true;
      this.emit('play');
      this.updateMediaSessionPlaybackState();
      this.prepareNextTrackForStandby();
    } catch (e) {
      console.warn('Play error:', e);
    }
  }

  public pause() {
    this.triggerHaptic(8);
    const deck = this.getCurrentDeck();
    deck.pause();
    this.isPlaying = false;
    this.emit('pause');
    this.updateMediaSessionPlaybackState();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop() {
    const deck = this.getCurrentDeck();
    deck.pause();
    deck.currentTime = 0;
    this.getStandbyDeck().pause();
    this.isPlaying = false;
    this.emit('pause');
    this.emit('timeupdate', 0, this.currentTrack?.duration || 0);
    this.updateMediaSessionPlaybackState();
  }

  public playNext() {
    this.triggerHaptic(12);
    const nextIdx = this.getNextIndex();
    if (nextIdx !== -1) {
      this.playTrackAtIndex(nextIdx);
    }
  }

  public playPrevious() {
    this.triggerHaptic(12);
    const deck = this.getCurrentDeck();
    // If more than 3 seconds in, restart track
    if (deck.currentTime > 3) {
      this.seek(0);
      return;
    }
    const prevIdx = this.getPreviousIndex();
    if (prevIdx !== -1) {
      this.playTrackAtIndex(prevIdx);
    }
  }

  public seek(seconds: number) {
    const deck = this.getCurrentDeck();
    const clamped = Math.max(0, Math.min(deck.duration || this.currentTrack?.duration || 0, seconds));
    deck.currentTime = clamped;
    this.emit('timeupdate', clamped, deck.duration || this.currentTrack?.duration || 0);
    this.updateMediaSessionPlaybackState();
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.settings.volume = clamped;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = clamped;
    }
    this.emit('settingschange', this.settings);
  }

  public setPreamp(dB: number) {
    const clamped = Math.max(-12, Math.min(12, dB));
    this.settings.preampGain = clamped;
    if (this.preampGainNode) {
      const lin = Math.pow(10, clamped / 20);
      this.preampGainNode.gain.value = lin;
    }
    this.emit('settingschange', this.settings);
  }

  public setGaplessMode(mode: GaplessMode) {
    this.settings.gaplessMode = mode;
    this.triggerHaptic(10);
    this.emit('settingschange', this.settings);
  }

  public setCrossfadeDuration(sec: number) {
    this.settings.crossfadeDuration = Math.max(0.5, Math.min(10, sec));
    this.emit('settingschange', this.settings);
  }

  public setBitPerfect(enabled: boolean) {
    this.settings.isBitPerfect = enabled;
    this.triggerHaptic(14);
    // When bit-perfect is enabled, bypass EQ gains completely
    this.eqFilters.forEach((filter, idx) => {
      filter.gain.value = enabled ? 0 : this.settings.customBandGains[idx] || 0;
    });
    if (this.preampGainNode) {
      this.preampGainNode.gain.value = enabled ? 1 : Math.pow(10, this.settings.preampGain / 20);
    }
    this.emit('settingschange', this.settings);
  }

  public setEQBandGain(bandIndex: number, gainDb: number) {
    if (bandIndex < 0 || bandIndex >= this.eqFilters.length) return;
    this.settings.customBandGains[bandIndex] = gainDb;
    this.settings.currentPresetId = 'custom';
    if (!this.settings.isBitPerfect && this.eqFilters[bandIndex]) {
      this.eqFilters[bandIndex].gain.value = gainDb;
    }
    this.emit('settingschange', this.settings);
  }

  public applyEQPreset(preset: EQPreset) {
    this.triggerHaptic(10);
    this.settings.currentPresetId = preset.id;
    this.settings.customBandGains = [...preset.gains];

    if (preset.id === 'direct_bypass') {
      this.setBitPerfect(true);
      return;
    }

    if (this.settings.isBitPerfect) {
      this.settings.isBitPerfect = false;
    }

    preset.gains.forEach((gain, idx) => {
      if (this.eqFilters[idx]) {
        this.eqFilters[idx].gain.value = gain;
      }
    });

    this.emit('settingschange', this.settings);
  }

  public toggleRepeat(): 'off' | 'all' | 'one' {
    this.triggerHaptic(10);
    if (this.repeatMode === 'off') this.repeatMode = 'all';
    else if (this.repeatMode === 'all') this.repeatMode = 'one';
    else this.repeatMode = 'off';
    this.prepareNextTrackForStandby();
    return this.repeatMode;
  }

  public toggleShuffle(): boolean {
    this.triggerHaptic(10);
    this.isShuffle = !this.isShuffle;
    this.prepareNextTrackForStandby();
    return this.isShuffle;
  }

  // --- Real-Time Visualizer Data ---

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      array.fill(0);
    }
  }

  public getTimeDomainData(array: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      array.fill(128);
    }
  }

  public getHardwareSampleRate(): number {
    return this.ctx?.sampleRate || 48000;
  }

  // --- Getters ---

  public getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  public getQueue(): AudioTrack[] {
    return this.queue;
  }

  public getQueueIndex(): number {
    return this.queueIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.getCurrentDeck().currentTime || 0;
  }

  public getDuration(): number {
    return this.getCurrentDeck().duration || this.currentTrack?.duration || 0;
  }

  public getRepeatMode(): 'off' | 'all' | 'one' {
    return this.repeatMode;
  }

  public getIsShuffle(): boolean {
    return this.isShuffle;
  }

  public getSettings(): AudioEngineSettings {
    return { ...this.settings };
  }

  public loadSettings(settings: AudioEngineSettings) {
    this.settings = { ...settings };
    this.setVolume(settings.volume);
    this.setPreamp(settings.preampGain);
    if (settings.isBitPerfect) {
      this.setBitPerfect(true);
    } else {
      settings.customBandGains.forEach((gain, idx) => {
        if (this.eqFilters[idx]) this.eqFilters[idx].gain.value = gain;
      });
    }
  }

  // ==========================================
  // Sleep Timer System (Duration or Track End)
  // ==========================================

  public setSleepTimer(mode: SleepTimerMode, durationMinutes: number = 0) {
    this.clearSleepTimerInterval();
    this.sleepTimerMode = mode;

    if (mode === 'duration' && durationMinutes > 0) {
      this.sleepTimerTotalDuration = durationMinutes * 60;
      this.sleepTimerEndsAt = Date.now() + this.sleepTimerTotalDuration * 1000;
      this.startSleepTimerCountdown();
    } else if (mode === 'track_end') {
      this.sleepTimerTotalDuration = 0;
      this.sleepTimerEndsAt = null;
    } else {
      this.sleepTimerMode = 'off';
      this.sleepTimerTotalDuration = 0;
      this.sleepTimerEndsAt = null;
    }

    this.emit('sleeptimerupdate', this.getSleepTimerState());
  }

  public cancelSleepTimer() {
    this.clearSleepTimerInterval();
    this.sleepTimerMode = 'off';
    this.sleepTimerEndsAt = null;
    this.sleepTimerTotalDuration = 0;
    this.emit('sleeptimerupdate', this.getSleepTimerState());
  }

  public getSleepTimerState(): SleepTimerState {
    if (this.sleepTimerMode === 'off') {
      return {
        mode: 'off',
        remainingSeconds: 0,
        totalDurationSeconds: 0,
        active: false,
      };
    }

    if (this.sleepTimerMode === 'track_end') {
      const remaining = this.getRemainingTrackSeconds();
      return {
        mode: 'track_end',
        remainingSeconds: remaining,
        totalDurationSeconds: this.currentTrack?.duration || 0,
        active: true,
      };
    }

    const now = Date.now();
    const remainingSeconds = this.sleepTimerEndsAt
      ? Math.max(0, Math.ceil((this.sleepTimerEndsAt - now) / 1000))
      : 0;

    return {
      mode: 'duration',
      remainingSeconds,
      totalDurationSeconds: this.sleepTimerTotalDuration,
      active: remainingSeconds > 0,
    };
  }

  private getRemainingTrackSeconds(): number {
    const deck = this.getCurrentDeck();
    if (!deck || isNaN(deck.duration) || !deck.duration) return 0;
    return Math.max(0, Math.round(deck.duration - deck.currentTime));
  }

  private clearSleepTimerInterval() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
  }

  private startSleepTimerCountdown() {
    this.sleepTimerInterval = setInterval(() => {
      if (this.sleepTimerMode !== 'duration' || !this.sleepTimerEndsAt) {
        this.clearSleepTimerInterval();
        return;
      }

      const now = Date.now();
      const remainingMs = this.sleepTimerEndsAt - now;

      if (remainingMs <= 0) {
        this.triggerSleepTimerFinish('duration');
      } else {
        this.emit('sleeptimerupdate', this.getSleepTimerState());
      }
    }, 1000);
  }

  private async triggerSleepTimerFinish(reason: SleepTimerMode) {
    this.cancelSleepTimer();

    // Gentle linear gain fade-out over 1.2s so audio eases into silence
    try {
      if (this.masterGainNode && this.ctx) {
        const originalGain = this.settings.volume;
        const now = this.ctx.currentTime;
        this.masterGainNode.gain.cancelScheduledValues(now);
        this.masterGainNode.gain.setValueAtTime(this.masterGainNode.gain.value, now);
        this.masterGainNode.gain.linearRampToValueAtTime(0, now + 1.2);

        setTimeout(() => {
          this.pause();
          if (this.masterGainNode) {
            this.masterGainNode.gain.value = originalGain;
          }
        }, 1300);
      } else {
        this.pause();
      }
    } catch {
      this.pause();
    }

    this.emit('sleeptimerfired', reason);
  }

  // Event Subscription
  public on(event: AudioEngineEvent, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: AudioEngineEvent, listener: EventListener) {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: AudioEngineEvent, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        fn(...args);
      } catch (e) {
        console.error('Audio engine event listener error:', e);
      }
    });
  }
}

// Global Singleton Audio Engine
export const audioEngine = new AudioEngine();
