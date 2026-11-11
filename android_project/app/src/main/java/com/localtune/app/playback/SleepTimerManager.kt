package com.localtune.app.playback

import com.localtune.app.model.SleepTimerState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SleepTimerManager(
    private val scope: CoroutineScope,
    private val onTimerExpired: (fadeDurationMs: Long) -> Unit
) {
    private val _timerState = MutableStateFlow(SleepTimerState())
    val timerState: StateFlow<SleepTimerState> = _timerState.asStateFlow()

    private var countdownJob: Job? = null

    fun startTimer(minutes: Int) {
        countdownJob?.cancel()
        val totalSeconds = minutes * 60

        _timerState.value = SleepTimerState(
            isActive = true,
            totalSeconds = totalSeconds,
            remainingSeconds = totalSeconds,
            stopAtTrackEnd = false
        )

        countdownJob = scope.launch(Dispatchers.Default) {
            while (_timerState.value.remainingSeconds > 0) {
                delay(1000L)
                val currentRemaining = _timerState.value.remainingSeconds - 1
                if (currentRemaining <= 0) {
                    _timerState.value = _timerState.value.copy(
                        isActive = false,
                        remainingSeconds = 0
                    )
                    onTimerExpired(3000L) // 3-second gentle fade-out
                    break
                } else {
                    _timerState.value = _timerState.value.copy(
                        remainingSeconds = currentRemaining
                    )
                }
            }
        }
    }

    fun setStopAtTrackEnd(enabled: Boolean) {
        countdownJob?.cancel()
        _timerState.value = SleepTimerState(
            isActive = enabled,
            totalSeconds = 0,
            remainingSeconds = 0,
            stopAtTrackEnd = enabled
        )
    }

    fun onTrackCompleted() {
        if (_timerState.value.isActive && _timerState.value.stopAtTrackEnd) {
            _timerState.value = SleepTimerState()
            onTimerExpired(500L)
        }
    }

    fun cancelTimer() {
        countdownJob?.cancel()
        countdownJob = null
        _timerState.value = SleepTimerState()
    }
}
