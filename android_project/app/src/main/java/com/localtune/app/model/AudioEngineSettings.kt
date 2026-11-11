package com.localtune.app.model

enum class GaplessMode {
    PURE,
    MICRO,
    CROSSFADE
}

data class AudioEngineSettings(
    val gaplessMode: GaplessMode = GaplessMode.PURE,
    val crossfadeDurationSec: Float = 2.0f,
    val volume: Float = 0.85f,
    val preampGainDb: Float = 0f,
    val isBitPerfect: Boolean = false,
    val currentPresetId: String = "flat",
    val customBandGains: FloatArray = FloatArray(10) { 0f },
    val screenWakeLock: Boolean = false
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AudioEngineSettings

        if (gaplessMode != other.gaplessMode) return false
        if (crossfadeDurationSec != other.crossfadeDurationSec) return false
        if (volume != other.volume) return false
        if (preampGainDb != other.preampGainDb) return false
        if (isBitPerfect != other.isBitPerfect) return false
        if (currentPresetId != other.currentPresetId) return false
        if (!customBandGains.contentEquals(other.customBandGains)) return false
        if (screenWakeLock != other.screenWakeLock) return false

        return true
    }

    override fun hashCode(): Int {
        var result = gaplessMode.hashCode()
        result = 31 * result + crossfadeDurationSec.hashCode()
        result = 31 * result + volume.hashCode()
        result = 31 * result + preampGainDb.hashCode()
        result = 31 * result + isBitPerfect.hashCode()
        result = 31 * result + currentPresetId.hashCode()
        result = 31 * result + customBandGains.contentHashCode()
        result = 31 * result + screenWakeLock.hashCode()
        return result
    }
}
