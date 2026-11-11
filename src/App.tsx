/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { audioEngine, EQ_PRESETS } from './audio/AudioEngine';
import { AppleBottomTabBar, AppleTab } from './components/AppleBottomTabBar';
import { AppleBrowseView } from './components/AppleBrowseView';
import { AppleLibraryView } from './components/AppleLibraryView';
import { AppleListenNowView } from './components/AppleListenNowView';
import { AppleMiniPlayer } from './components/AppleMiniPlayer';
import { AppleNowPlaying } from './components/AppleNowPlaying';
import { AppleSearchView } from './components/AppleSearchView';
import { AppleSettingsModal } from './components/AppleSettingsModal';
import { EqualizerModal } from './components/EqualizerModal';
import { ImportModal } from './components/ImportModal';
import { QueueSheet } from './components/QueueSheet';
import { TrackDetailsModal } from './components/TrackDetailsModal';
import {
  deleteTrack,
  getAllTracks,
  getSettings,
  getStorageUsage,
  purgeDemoTracks,
  saveSettings,
  saveTracks,
} from './services/storage';
import { AudioEngineSettings, AudioTrack, EQPreset, GaplessMode, SleepTimerMode, SleepTimerState } from './types/audio';

export default function App() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [settings, setSettings] = useState<AudioEngineSettings>(audioEngine.getSettings());
  const [outputSampleRate, setOutputSampleRate] = useState(48000);
  const [storageUsage, setStorageUsage] = useState({ usedBytes: 0, trackCount: 0 });

  // Sleep Timer State
  const [sleepTimerState, setSleepTimerState] = useState<SleepTimerState>(audioEngine.getSleepTimerState());

  // Apple Music Tabs: 'listen_now' | 'browse' | 'library' | 'search'
  const [activeTab, setActiveTab] = useState<AppleTab>('library');

  // Modals
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isEQOpen, setIsEQOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [detailsTrack, setDetailsTrack] = useState<AudioTrack | null>(null);

  // Initialize Library & Audio Settings
  useEffect(() => {
    async function init() {
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
      audioEngine.loadSettings(loadedSettings);

      // Purge any pre-loaded demo music
      await purgeDemoTracks();

      const storedTracks = await getAllTracks();
      const userTracks = storedTracks.filter((t) => !t.isBuiltInDemo && !t.id.startsWith('demo_track_'));
      setTracks(userTracks);

      if (userTracks.length > 0) {
        setCurrentTrack(userTracks[0]);
        audioEngine.setQueue(userTracks, 0, false);
      } else {
        setCurrentTrack(null);
        audioEngine.clearQueue();
      }

      const usage = await getStorageUsage();
      setStorageUsage(usage);
      setOutputSampleRate(audioEngine.getHardwareSampleRate());
    }

    init();
  }, []);

  // Subscribe to Audio Engine Events
  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = (time: unknown, dur: unknown) => {
      setCurrentTime(time as number);
      if (dur && !isNaN(dur as number) && (dur as number) > 0) {
        setDuration(dur as number);
      }
    };
    const handleTrackChange = (track: unknown) => {
      setCurrentTrack(track as AudioTrack | null);
      if (track) {
        setDuration((track as AudioTrack).duration || 0);
      }
    };
    const handleQueueChange = (q: unknown) => {
      setQueue([...(q as AudioTrack[])]);
      setQueueIndex(audioEngine.getQueueIndex());
    };
    const handleSettingsChange = (newSettings: unknown) => {
      const s = newSettings as AudioEngineSettings;
      setSettings(s);
      saveSettings(s);
    };
    const handleSleepTimerUpdate = (st: unknown) => {
      setSleepTimerState(st as SleepTimerState);
    };

    audioEngine.on('play', handlePlay);
    audioEngine.on('pause', handlePause);
    audioEngine.on('timeupdate', handleTimeUpdate);
    audioEngine.on('trackchange', handleTrackChange);
    audioEngine.on('queuechange', handleQueueChange);
    audioEngine.on('settingschange', handleSettingsChange);
    audioEngine.on('sleeptimerupdate', handleSleepTimerUpdate);

    return () => {
      audioEngine.off('play', handlePlay);
      audioEngine.off('pause', handlePause);
      audioEngine.off('timeupdate', handleTimeUpdate);
      audioEngine.off('trackchange', handleTrackChange);
      audioEngine.off('queuechange', handleQueueChange);
      audioEngine.off('settingschange', handleSettingsChange);
      audioEngine.off('sleeptimerupdate', handleSleepTimerUpdate);
    };
  }, []);

  // Handlers
  const handlePlayTrack = (track: AudioTrack, index: number) => {
    audioEngine.setQueue(tracks, index, true);
  };

  const handleTogglePlay = () => {
    audioEngine.togglePlay();
  };

  const handleNext = () => {
    audioEngine.playNext();
  };

  const handlePrevious = () => {
    audioEngine.playPrevious();
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
  };

  const handleToggleRepeat = () => {
    setRepeatMode(audioEngine.toggleRepeat());
  };

  const handleToggleShuffle = () => {
    setIsShuffle(audioEngine.toggleShuffle());
  };

  const handleSetVolume = (vol: number) => {
    audioEngine.setVolume(vol);
  };

  const handleSetGaplessMode = (mode: GaplessMode) => {
    audioEngine.setGaplessMode(mode);
  };

  const handleToggleBitPerfect = () => {
    audioEngine.setBitPerfect(!settings.isBitPerfect);
  };

  const handleSetBandGain = (bandIndex: number, gainDb: number) => {
    audioEngine.setEQBandGain(bandIndex, gainDb);
  };

  const handleApplyPreset = (preset: EQPreset) => {
    audioEngine.applyEQPreset(preset);
  };

  const handleSetPreamp = (gainDb: number) => {
    audioEngine.setPreamp(gainDb);
  };

  const handlePlayNextInQueue = (track: AudioTrack) => {
    audioEngine.playNextInQueue(track);
  };

  const handleAddToQueue = (track: AudioTrack) => {
    audioEngine.addToQueue(track);
  };

  const handleSetSleepTimer = (mode: SleepTimerMode, durationMinutes: number = 0) => {
    audioEngine.setSleepTimer(mode, durationMinutes);
  };

  const handleCancelSleepTimer = () => {
    audioEngine.cancelSleepTimer();
  };

  const handleDeleteTrack = async (trackId: string) => {
    await deleteTrack(trackId);
    const updated = tracks.filter((t) => t.id !== trackId);
    setTracks(updated);
    audioEngine.setQueue(updated, 0, false);
    const usage = await getStorageUsage();
    setStorageUsage(usage);
  };

  const handleTracksImported = async (newTracks: AudioTrack[]) => {
    await saveTracks(newTracks);
    const all = [...tracks, ...newTracks];
    setTracks(all);
    audioEngine.setQueue(all, tracks.length, true);
    const usage = await getStorageUsage();
    setStorageUsage(usage);
  };

  return (
    <div className="w-full min-h-screen bg-[#040406] flex items-center justify-center font-sans antialiased text-white select-none relative overflow-hidden">
      
      {/* Background Chromatic Lucid Light Caustics */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#fa2d48]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#7c4dff]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -top-20 right-1/3 w-80 h-80 bg-[#00e5ff]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Device Glass Canvas:
          On mobile phones, fills the screen (100vw/100vh).
          On desktop, renders as a pristine Lucid Glass device with refraction. */}
      <div className="w-full md:max-w-[430px] md:h-[92vh] md:max-h-[900px] bg-[#0c0c10]/80 backdrop-blur-3xl flex flex-col md:rounded-[48px] md:border md:border-white/[0.18] md:shadow-[0_25px_80px_rgba(0,0,0,0.95),_inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden relative z-10">
        
        {/* Apple Music Views Router */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative bg-[#000000]">
          {activeTab === 'listen_now' && (
            <AppleListenNowView
              tracks={tracks}
              sleepTimerState={sleepTimerState}
              onPlayTrack={handlePlayTrack}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'browse' && (
            <AppleBrowseView
              tracks={tracks}
              sleepTimerState={sleepTimerState}
              onPlayTrack={handlePlayTrack}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'library' && (
            <AppleLibraryView
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              sleepTimerState={sleepTimerState}
              onPlayTrack={handlePlayTrack}
              onPlayNext={handlePlayNextInQueue}
              onAddToQueue={handleAddToQueue}
              onShowDetails={(t) => setDetailsTrack(t)}
              onDeleteTrack={handleDeleteTrack}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'search' && (
            <AppleSearchView
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onPlayNext={handlePlayNextInQueue}
              onAddToQueue={handleAddToQueue}
              onShowDetails={(t) => setDetailsTrack(t)}
              onDeleteTrack={handleDeleteTrack}
            />
          )}
        </div>

        {/* Signature Apple Music Mini-Player (Resting above Tab Bar) */}
        {currentTrack && !isPlayerOpen && (
          <AppleMiniPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={handleTogglePlay}
            onNext={handleNext}
            onExpand={() => setIsPlayerOpen(true)}
          />
        )}

        {/* Apple Music Bottom Tab Bar */}
        <AppleBottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Signature Full-Screen Apple Music Player */}
        <AppleNowPlaying
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          repeatMode={repeatMode}
          isShuffle={isShuffle}
          settings={settings}
          sleepTimerState={sleepTimerState}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSeek={handleSeek}
          onToggleRepeat={handleToggleRepeat}
          onToggleShuffle={handleToggleShuffle}
          onSetVolume={handleSetVolume}
          onSetGaplessMode={handleSetGaplessMode}
          onOpenEQ={() => setIsEQOpen(true)}
          onOpenQueue={() => setIsQueueOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Apple Settings Modal with Sleep Timer & Audio Engine */}
        <AppleSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          sleepTimerState={sleepTimerState}
          onSetSleepTimer={handleSetSleepTimer}
          onCancelSleepTimer={handleCancelSleepTimer}
          settings={settings}
          onSetGaplessMode={handleSetGaplessMode}
          onToggleBitPerfect={handleToggleBitPerfect}
          onOpenImport={() => {
            setIsSettingsOpen(false);
            setIsImportOpen(true);
          }}
          storageUsage={storageUsage}
        />

        {/* Equalizer & Audio DSP Modal */}
        <EqualizerModal
          isOpen={isEQOpen}
          onClose={() => setIsEQOpen(false)}
          settings={settings}
          onSetBandGain={handleSetBandGain}
          onApplyPreset={handleApplyPreset}
          onSetPreamp={handleSetPreamp}
          onToggleBitPerfect={handleToggleBitPerfect}
        />

        {/* Up Next Queue Sheet */}
        <QueueSheet
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          queue={queue}
          queueIndex={queueIndex}
          gaplessMode={settings.gaplessMode}
          onPlayTrackAtIndex={(idx) => audioEngine.playTrackAtIndex(idx)}
          onRemoveFromQueue={(idx) => audioEngine.removeFromQueue(idx)}
          onClearQueue={() => audioEngine.clearQueue()}
        />

        {/* Device Local Audio Import Modal */}
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onTracksImported={handleTracksImported}
          storageUsage={storageUsage}
        />

        {/* Technical Audio Stream Inspector */}
        <TrackDetailsModal
          track={detailsTrack}
          onClose={() => setDetailsTrack(null)}
        />

      </div>

    </div>
  );
}
