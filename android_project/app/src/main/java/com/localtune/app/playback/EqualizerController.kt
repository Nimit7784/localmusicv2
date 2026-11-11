package com.localtune.app.playback

import android.media.audiofx.Equalizer
import android.util.Log
import com.localtune.app.model.EQPreset
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class EqualizerController {
    private var equalizer: Equalizer? = null
    private var currentAudioSessionId: Int = 0

    private val _isEnabled = MutableStateFlow(false)
    val isEnabled: StateFlow<Boolean> = _isEnabled.asStateFlow()

    private val _bandLevels = MutableStateFlow(List(10) { 0f })
    val bandLevels: StateFlow<List<Float>> = _bandLevels.asStateFlow()

    private val _currentPreset = MutableStateFlow(EQPreset.PRESETS.first())
    val currentPreset: StateFlow<EQPreset> = _currentPreset.asStateFlow()

    fun bindAudioSession(audioSessionId: Int) {
        if (audioSessionId == 0 || audioSessionId == currentAudioSessionId) return
        release()
        currentAudioSessionId = audioSessionId

        try {
            equalizer = Equalizer(0, audioSessionId).apply {
                enabled = _isEnabled.value
            }
            applyBandsToHardware()
        } catch (e: Exception) {
            Log.e("EqualizerController", "Failed to init Equalizer for session $audioSessionId", e)
        }
    }

    fun setEnabled(enabled: Boolean) {
        _isEnabled.value = enabled
        try {
            equalizer?.enabled = enabled
        } catch (e: Exception) {
            Log.e("EqualizerController", "Failed to set equalizer enabled state", e)
        }
    }

    fun setBandLevel(bandIndex: Int, levelDb: Float) {
        val updated = _bandLevels.value.toMutableList()
        if (bandIndex in updated.indices) {
            updated[bandIndex] = levelDb.coerceIn(-12f, 12f)
            _bandLevels.value = updated
            applyBandsToHardware()
        }
    }

    fun applyPreset(preset: EQPreset) {
        _currentPreset.value = preset
        val updated = _bandLevels.value.toMutableList()
        for (i in updated.indices) {
            updated[i] = if (i in preset.gains.indices) preset.gains[i] else 0f
        }
        _bandLevels.value = updated
        applyBandsToHardware()
    }

    private fun applyBandsToHardware() {
        val eq = equalizer ?: return
        if (!_isEnabled.value) return

        try {
            val numBands = eq.numberOfBands.toInt()
            val minRange = eq.bandLevelRange[0] // millibels
            val maxRange = eq.bandLevelRange[1] // millibels

            for (i in 0 until numBands) {
                val db = _bandLevels.value.getOrElse(i) { 0f }
                // Convert dB (-12 to +12) to millibels (-1200 to +1200)
                val mB = (db * 100f).toInt().coerceIn(minRange.toInt(), maxRange.toInt()).toShort()
                eq.setBandLevel(i.toShort(), mB)
            }
        } catch (e: Exception) {
            Log.w("EqualizerController", "Could not apply band to hardware: ${e.message}")
        }
    }

    fun release() {
        try {
            equalizer?.release()
        } catch (e: Exception) {
            Log.e("EqualizerController", "Error releasing equalizer", e)
        }
        equalizer = null
        currentAudioSessionId = 0
    }
}
