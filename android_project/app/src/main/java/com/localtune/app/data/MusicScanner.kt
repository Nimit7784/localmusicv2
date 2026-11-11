package com.localtune.app.data

import android.content.ContentUris
import android.content.Context
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import com.localtune.app.model.AudioTrack
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MusicScanner(private val context: Context) {

    suspend fun scanLocalAudioFiles(): List<AudioTrack> = withContext(Dispatchers.IO) {
        val tracks = mutableListOf<AudioTrack>()
        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
        } else {
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        }

        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.ALBUM_ID,
            MediaStore.Audio.Media.MIME_TYPE
        )

        val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"
        val sortOrder = "${MediaStore.Audio.Media.DATE_ADDED} DESC"

        try {
            context.contentResolver.query(
                collection,
                projection,
                selection,
                null,
                sortOrder
            )?.use { cursor ->
                val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                val albumCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                val durationCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                val dataCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
                val albumIdCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
                val mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE)

                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idCol)
                    val title = cursor.getString(titleCol) ?: "Unknown Track"
                    val artist = cursor.getString(artistCol) ?: "Unknown Artist"
                    val album = cursor.getString(albumCol) ?: "Unknown Album"
                    val durationMs = cursor.getLong(durationCol)
                    val filePath = cursor.getString(dataCol) ?: ""
                    val size = cursor.getLong(sizeCol)
                    val albumId = cursor.getLong(albumIdCol)
                    val mimeType = cursor.getString(mimeCol) ?: ""

                    // Ignore tiny notification audio clips (< 5 seconds)
                    if (durationMs < 5000) continue

                    val contentUri = ContentUris.withAppendedId(
                        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                        id
                    )

                    val albumArtUri = ContentUris.withAppendedId(
                        Uri.parse("content://media/external/audio/albumart"),
                        albumId
                    )

                    val format = when {
                        filePath.endsWith(".flac", ignoreCase = true) || mimeType.contains("flac") -> "FLAC"
                        filePath.endsWith(".wav", ignoreCase = true) || mimeType.contains("wav") -> "WAV"
                        filePath.endsWith(".alac", ignoreCase = true) || filePath.endsWith(".m4a", ignoreCase = true) -> "ALAC"
                        filePath.endsWith(".aiff", ignoreCase = true) || filePath.endsWith(".aif", ignoreCase = true) -> "AIFF"
                        filePath.endsWith(".aac", ignoreCase = true) -> "AAC"
                        filePath.endsWith(".ogg", ignoreCase = true) -> "OGG"
                        filePath.endsWith(".opus", ignoreCase = true) -> "OPUS"
                        else -> "MP3"
                    }

                    val isHiRes = format in listOf("FLAC", "WAV", "ALAC", "AIFF")

                    tracks.add(
                        AudioTrack(
                            id = id.toString(),
                            title = title,
                            artist = if (artist == "<unknown>") "Unknown Artist" else artist,
                            album = if (album == "<unknown>") "Unknown Album" else album,
                            durationMs = durationMs,
                            contentUri = contentUri,
                            filePath = filePath,
                            albumArtUri = albumArtUri,
                            format = format,
                            bitDepth = if (isHiRes) 24 else 16,
                            sampleRate = if (isHiRes) 96000 else 44100,
                            bitrateKbps = if (isHiRes) 1411 else 320,
                            isHiRes = isHiRes,
                            fileSize = size
                        )
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        tracks
    }
}
