package com.localtune.app.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.localtune.app.playback.MusicViewModel
import com.localtune.app.ui.components.AppleBottomTabBar
import com.localtune.app.ui.components.AppleMiniPlayer
import com.localtune.app.ui.components.AppleNowPlayingSheet
import com.localtune.app.ui.components.AppleSettingsModal
import com.localtune.app.ui.components.EqualizerSheet
import com.localtune.app.ui.components.NavigationTab
import com.localtune.app.ui.components.QueueSheet
import com.localtune.app.ui.components.SleepTimerSheet
import com.localtune.app.ui.screens.LibraryScreen
import com.localtune.app.ui.screens.ListenNowScreen
import com.localtune.app.ui.screens.SearchScreen
import com.localtune.app.ui.theme.DarkBackground

@Composable
fun MainScreen(
    viewModel: MusicViewModel,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(NavigationTab.LISTEN_NOW) }

    // Modal sheet visibility states
    var isNowPlayingOpen by remember { mutableStateOf(false) }
    var isEqualizerOpen by remember { mutableStateOf(false) }
    var isSleepTimerOpen by remember { mutableStateOf(false) }
    var isSettingsOpen by remember { mutableStateOf(false) }
    var isQueueOpen by remember { mutableStateOf(false) }

    // ViewModel state collections
    val tracks by viewModel.tracks.collectAsState()
    val isScanning by viewModel.isScanning.collectAsState()
    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()
    val progressMs by viewModel.currentPositionMs.collectAsState()
    val durationMs by viewModel.durationMs.collectAsState()
    val shuffleEnabled by viewModel.shuffleEnabled.collectAsState()
    val repeatMode by viewModel.repeatMode.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val queue by viewModel.queue.collectAsState()
    val audioSettings by viewModel.audioSettings.collectAsState()
    val sleepTimerState by viewModel.sleepTimerState.collectAsState()

    val eqEnabled by viewModel.equalizer.isEnabled.collectAsState()
    val eqBandLevels by viewModel.equalizer.bandLevels.collectAsState()
    val eqCurrentPreset by viewModel.equalizer.currentPreset.collectAsState()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Tab Content
        when (selectedTab) {
            NavigationTab.LISTEN_NOW -> {
                ListenNowScreen(
                    tracks = tracks,
                    currentTrack = currentTrack,
                    sleepTimerState = sleepTimerState,
                    onTrackClick = { viewModel.playTrack(it) },
                    onOpenSettings = { isSettingsOpen = true },
                    onOpenSleepTimer = { isSleepTimerOpen = true }
                )
            }
            NavigationTab.LIBRARY -> {
                LibraryScreen(
                    tracks = tracks,
                    currentTrack = currentTrack,
                    isScanning = isScanning,
                    onTrackClick = { viewModel.playTrack(it) },
                    onScanClick = { viewModel.scanMusic() },
                    onOpenSettings = { isSettingsOpen = true }
                )
            }
            NavigationTab.SEARCH -> {
                SearchScreen(
                    tracks = tracks,
                    currentTrack = currentTrack,
                    onTrackClick = { viewModel.playTrack(it) }
                )
            }
        }

        // Mini player docked above bottom navigation
        if (currentTrack != null) {
            AppleMiniPlayer(
                track = currentTrack,
                isPlaying = isPlaying,
                progressMs = progressMs,
                durationMs = durationMs,
                onPlayPause = { viewModel.togglePlayPause() },
                onSkipNext = { viewModel.skipToNext() },
                onClick = { isNowPlayingOpen = true },
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 68.dp)
            )
        }

        // Apple 3-Tab Bottom Bar
        AppleBottomTabBar(
            selectedTab = selectedTab,
            onTabSelected = { selectedTab = it },
            modifier = Modifier.align(Alignment.BottomCenter)
        )

        // Full Screen Now Playing Sheet
        AnimatedVisibility(
            visible = isNowPlayingOpen && currentTrack != null,
            enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
        ) {
            AppleNowPlayingSheet(
                track = currentTrack,
                isPlaying = isPlaying,
                progressMs = progressMs,
                durationMs = durationMs,
                isFavorite = currentTrack?.let { favorites.contains(it.id) } == true,
                shuffleEnabled = shuffleEnabled,
                repeatMode = repeatMode,
                onDismiss = { isNowPlayingOpen = false },
                onPlayPause = { viewModel.togglePlayPause() },
                onSkipNext = { viewModel.skipToNext() },
                onSkipPrevious = { viewModel.skipToPrevious() },
                onSeekTo = { viewModel.seekTo(it) },
                onToggleFavorite = { currentTrack?.let { viewModel.toggleFavorite(it.id) } },
                onToggleShuffle = { viewModel.toggleShuffle() },
                onCycleRepeat = { viewModel.cycleRepeatMode() },
                onOpenEqualizer = { isEqualizerOpen = true },
                onOpenSleepTimer = { isSleepTimerOpen = true },
                onOpenQueue = { isQueueOpen = true }
            )
        }

        // Modal Bottom Sheets
        if (isEqualizerOpen) {
            EqualizerSheet(
                isEnabled = eqEnabled,
                bandLevels = eqBandLevels,
                currentPreset = eqCurrentPreset,
                onToggleEnabled = { viewModel.equalizer.setEnabled(it) },
                onSetBandLevel = { idx, lvl -> viewModel.equalizer.setBandLevel(idx, lvl) },
                onApplyPreset = { viewModel.equalizer.applyPreset(it) },
                onDismiss = { isEqualizerOpen = false }
            )
        }

        if (isSleepTimerOpen) {
            SleepTimerSheet(
                state = sleepTimerState,
                onStartTimer = { min -> viewModel.sleepTimer.startTimer(min) },
                onSetStopAtTrackEnd = { stop -> viewModel.sleepTimer.setStopAtTrackEnd(stop) },
                onCancelTimer = { viewModel.sleepTimer.cancelTimer() },
                onDismiss = { isSleepTimerOpen = false }
            )
        }

        if (isQueueOpen) {
            QueueSheet(
                queue = queue,
                currentTrack = currentTrack,
                onTrackClick = { viewModel.playTrack(it) },
                onDismiss = { isQueueOpen = false }
            )
        }

        if (isSettingsOpen) {
            AppleSettingsModal(
                settings = audioSettings,
                sleepTimerState = sleepTimerState,
                trackCount = tracks.size,
                onUpdateSettings = { viewModel.updateAudioSettings(it) },
                onOpenSleepTimer = {
                    isSettingsOpen = false
                    isSleepTimerOpen = true
                },
                onRescanLibrary = { viewModel.scanMusic() },
                onDismiss = { isSettingsOpen = false }
            )
        }
    }
}
