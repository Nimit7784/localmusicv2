package com.localtune.app.model

enum class SleepTimerMode {
    OFF,
    DURATION,
    TRACK_END
}

data class SleepTimerState(
    val mode: SleepTimerMode = SleepTimerMode.OFF,
    val remainingSeconds: Int = 0,
    val totalSeconds: Int = 0,
    val active: Boolean = false
) {
    val formattedRemaining: String
        get() {
            val minutes = remainingSeconds / 60
            val seconds = remainingSeconds % 60
            return "%d:%02d".format(minutes, seconds)
        }
}
