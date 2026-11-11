package com.localtune.app.model

import android.net.Uri

data class AudioTrack(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val durationMs: Long,
    val contentUri: Uri,
    val filePath: String = "",
    val albumArtUri: Uri? = null,
    val format: String = "FLAC",
    val bitDepth: Int = 24,
    val sampleRate: Int = 96000,
    val bitrateKbps: Int = 1411,
    val isHiRes: Boolean = true,
    val fileSize: Long = 0L,
    val year: Int? = null,
    val genre: String? = null
) {
    val durationSeconds: Long
        get() = durationMs / 1000

    val formattedDuration: String
        get() {
            val totalSeconds = durationMs / 1000
            val minutes = totalSeconds / 60
            val seconds = totalSeconds % 60
            return "%d:%02d".format(minutes, seconds)
        }
}
