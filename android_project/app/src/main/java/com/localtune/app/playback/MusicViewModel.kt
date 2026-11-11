package com.localtune.app.playback

import android.app.Application
import android.content.ComponentName
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import com.localtune.app.data.MusicScanner
import com.localtune.app.model.AudioEngineSettings
import com.localtune.app.model.AudioTrack
import com.localtune.app.model.EQPreset
import com.localtune.app.model.SleepTimerState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MusicViewModel(application: Application) : AndroidViewModel(application) {
    private val context = application.applicationContext
    private val scanner = MusicScanner(context)
    val equalizer = EqualizerController()

    private var controllerFuture: ListenableFuture<MediaController>? = null
    var mediaController: MediaController? = null
        private set

    private val handler = Handler(Looper.getMainLooper())
    private val progressRunnable = object : Runnable {
        override fun run() {
            mediaController?.let { controller ->
                _currentPositionMs.value = controller.currentPosition
                _durationMs.value = controller.duration.coerceAtLeast(0L)
            }
            if (_isPlaying.value) {
                handler.postDelayed(this, 500L)
            }
        }
    }

    // State flows
    private val _tracks = MutableStateFlow<List<AudioTrack>>(emptyList())
    val tracks: StateFlow<List<AudioTrack>> = _tracks.asStateFlow()

    private val _isScanning = MutableStateFlow(false)
    val isScanning: StateFlow<Boolean> = _isScanning.asStateFlow()

    private val _currentTrack = MutableStateFlow<AudioTrack?>(null)
    val currentTrack: StateFlow<AudioTrack?> = _currentTrack.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPositionMs = MutableStateFlow(0L)
    val currentPositionMs: StateFlow<Long> = _currentPositionMs.asStateFlow()

    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs.asStateFlow()

    private val _shuffleEnabled = MutableStateFlow(false)
    val shuffleEnabled: StateFlow<Boolean> = _shuffleEnabled.asStateFlow()

    private val _repeatMode = MutableStateFlow(Player.REPEAT_MODE_OFF)
    val repeatMode: StateFlow<Int> = _repeatMode.asStateFlow()

    private val _favorites = MutableStateFlow<Set<Long>>(emptySet())
    val favorites: StateFlow<Set<Long>> = _favorites.asStateFlow()

    private val _queue = MutableStateFlow<List<AudioTrack>>(emptyList())
    val queue: StateFlow<List<AudioTrack>> = _queue.asStateFlow()

    private val _audioSettings = MutableStateFlow(AudioEngineSettings())
    val audioSettings: StateFlow<AudioEngineSettings> = _audioSettings.asStateFlow()

    // Sleep timer
    val sleepTimer = SleepTimerManager(viewModelScope) { fadeMs ->
        // Fade out or pause
        mediaController?.pause()
    }
    val sleepTimerState: StateFlow<SleepTimerState> = sleepTimer.timerState

    init {
        initMediaController()
    }

    private fun initMediaController() {
        val sessionToken = SessionToken(
            context,
            ComponentName(context, PlaybackService::class.java)
        )
        controllerFuture = MediaController.Builder(context, sessionToken).buildAsync()
        controllerFuture?.addListener({
            try {
                val controller = controllerFuture?.get() ?: return@addListener
                mediaController = controller

                controller.addListener(object : Player.Listener {
                    override fun onIsPlayingChanged(isPlaying: Boolean) {
                        _isPlaying.value = isPlaying
                        if (isPlaying) {
                            handler.post(progressRunnable)
                        } else {
                            handler.removeCallbacks(progressRunnable)
                        }
                    }

                    override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                        val trackId = mediaItem?.mediaId?.toLongOrNull()
                        val track = _tracks.value.find { it.id == trackId }
                        _currentTrack.value = track
                        sleepTimer.onTrackCompleted()
                    }

                    override fun onPlaybackStateChanged(playbackState: Int) {
                        if (playbackState == Player.STATE_ENDED) {
                            sleepTimer.onTrackCompleted()
                        }
                    }
                })
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, MoreExecutors.directExecutor())
    }

    fun scanMusic() {
        viewModelScope.launch(Dispatchers.IO) {
            _isScanning.value = true
            val scanned = scanner.scanAudioFiles()
            _tracks.value = scanned
            _isScanning.value = false
        }
    }

    fun playTrack(track: AudioTrack, playlist: List<AudioTrack> = _tracks.value) {
        val controller = mediaController ?: return
        _queue.value = playlist
        _currentTrack.value = track

        val mediaItems = playlist.map { item ->
            MediaItem.Builder()
                .setMediaId(item.id.toString())
                .setUri(item.contentUri)
                .setMediaMetadata(
                    MediaMetadata.Builder()
                        .setTitle(item.title)
                        .setArtist(item.artist)
                        .setAlbumTitle(item.album)
                        .build()
                )
                .build()
        }

        val startIndex = playlist.indexOfFirst { it.id == track.id }.coerceAtLeast(0)
        controller.setMediaItems(mediaItems, startIndex, 0L)
        controller.prepare()
        controller.play()
    }

    fun togglePlayPause() {
        val controller = mediaController ?: return
        if (controller.isPlaying) {
            controller.pause()
        } else {
            if (controller.mediaItemCount == 0 && _tracks.value.isNotEmpty()) {
                playTrack(_tracks.value.first())
            } else {
                controller.play()
            }
        }
    }

    fun skipToNext() {
        mediaController?.seekToNextMediaItem()
    }

    fun skipToPrevious() {
        mediaController?.seekToPreviousMediaItem()
    }

    fun seekTo(positionMs: Long) {
        mediaController?.seekTo(positionMs)
        _currentPositionMs.value = positionMs
    }

    fun toggleShuffle() {
        val controller = mediaController ?: return
        val newShuffle = !_shuffleEnabled.value
        _shuffleEnabled.value = newShuffle
        controller.shuffleModeEnabled = newShuffle
    }

    fun cycleRepeatMode() {
        val controller = mediaController ?: return
        val nextMode = when (_repeatMode.value) {
            Player.REPEAT_MODE_OFF -> Player.REPEAT_MODE_ALL
            Player.REPEAT_MODE_ALL -> Player.REPEAT_MODE_ONE
            else -> Player.REPEAT_MODE_OFF
        }
        _repeatMode.value = nextMode
        controller.repeatMode = nextMode
    }

    fun toggleFavorite(trackId: Long) {
        val current = _favorites.value.toMutableSet()
        if (current.contains(trackId)) {
            current.remove(trackId)
        } else {
            current.add(trackId)
        }
        _favorites.value = current
    }

    fun updateAudioSettings(newSettings: AudioEngineSettings) {
        _audioSettings.value = newSettings
    }

    override fun onCleared() {
        handler.removeCallbacks(progressRunnable)
        controllerFuture?.let { MediaController.releaseFuture(it) }
        equalizer.release()
        super.onCleared()
    }
}
