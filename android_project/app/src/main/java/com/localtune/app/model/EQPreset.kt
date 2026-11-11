package com.localtune.app.model

data class EQPreset(
    val id: String,
    val name: String,
    val description: String,
    val gains: FloatArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as EQPreset

        if (id != other.id) return false
        if (name != other.name) return false
        if (description != other.description) return false
        if (!gains.contentEquals(other.gains)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + name.hashCode()
        result = 31 * result + description.hashCode()
        result = 31 * result + gains.contentHashCode()
        return result
    }

    companion object {
        val PRESETS = listOf(
            EQPreset(
                id = "flat",
                name = "Studio Reference (Flat)",
                description = "Uncolored linear frequency response for critical studio monitoring.",
                gains = floatArrayOf(0f, 0f, 0f, 0f, 0f, 0f, 0f, 0f, 0f, 0f)
            ),
            EQPreset(
                id = "warmth",
                name = "Analog Warmth",
                description = "Lush low-end warmth and smoothed upper treble.",
                gains = floatArrayOf(2.5f, 3.0f, 2.0f, 1.0f, 0f, -0.5f, 0.5f, 1.0f, 1.5f, 0.5f)
            ),
            EQPreset(
                id = "bass",
                name = "Bass Definition",
                description = "Tight sub-bass articulation without muddying midrange.",
                gains = floatArrayOf(5.0f, 4.0f, 2.5f, 1.0f, -1.0f, 0f, 0.5f, 1.0f, 0f, 0f)
            ),
            EQPreset(
                id = "vocal",
                name = "Vocal Presence",
                description = "Elevates human vocal timbre and acoustic strings.",
                gains = floatArrayOf(-1.0f, -0.5f, 0f, 1.0f, 2.5f, 3.5f, 2.0f, 1.0f, 0f, 0.5f)
            ),
            EQPreset(
                id = "air",
                name = "IEM High-Air",
                description = "Compensates for in-ear monitor roll-off with extended harmonics.",
                gains = floatArrayOf(1.0f, 0.5f, 0f, -0.5f, 0f, 0.5f, 1.5f, 2.5f, 4.0f, 5.0f)
            )
        )

        val DEFAULT_PRESETS: List<EQPreset>
            get() = PRESETS
    }
}
