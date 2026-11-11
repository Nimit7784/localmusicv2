package com.localtune.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localtune.app.R
import com.localtune.app.model.AudioEngineSettings
import com.localtune.app.model.SleepTimerState
import com.localtune.app.ui.theme.AppleCrimson
import com.localtune.app.ui.theme.DarkSurface
import com.localtune.app.ui.theme.GlassBackground
import com.localtune.app.ui.theme.GlassBorder
import com.localtune.app.ui.theme.TextMuted
import com.localtune.app.ui.theme.TextPrimary
import com.localtune.app.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppleSettingsModal(
    settings: AudioEngineSettings,
    sleepTimerState: SleepTimerState,
    trackCount: Int,
    onUpdateSettings: (AudioEngineSettings) -> Unit,
    onOpenSleepTimer: () -> Unit,
    onRescanLibrary: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = DarkSurface,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 10.dp)
                    .size(width = 36.dp, height = 4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Color.White.copy(alpha = 0.3f))
            )
        }
    ) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 8.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_settings),
                    contentDescription = null,
                    tint = AppleCrimson,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Settings",
                    color = TextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Sleep Timer section
            Text(
                text = "SLEEP TIMER",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp)
            )

            LucidGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onOpenSleepTimer),
                shape = RoundedCornerShape(16.dp),
                backgroundColor = GlassBackground,
                borderColor = GlassBorder
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_timer),
                            contentDescription = null,
                            tint = if (sleepTimerState.isActive) AppleCrimson else TextSecondary,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Sleep Timer",
                                color = TextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = if (sleepTimerState.isActive) {
                                    if (sleepTimerState.stopAtTrackEnd) "Stopping at end of track"
                                    else "Active (${sleepTimerState.formattedRemaining} remaining)"
                                } else "Off - Tap to configure",
                                color = if (sleepTimerState.isActive) AppleCrimson else TextMuted,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Text(
                        text = if (sleepTimerState.isActive) "Change" else "Set",
                        color = AppleCrimson,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Audio Engine section
            Text(
                text = "AUDIO ENGINE",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp)
            )

            LucidGlassCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                backgroundColor = GlassBackground,
                borderColor = GlassBorder
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Gapless Playback
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Gapless Playback",
                                color = TextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "Zero silence transition between album tracks",
                                color = TextMuted,
                                fontSize = 12.sp
                            )
                        }
                        Switch(
                            checked = settings.gapless,
                            onCheckedChange = { onUpdateSettings(settings.copy(gapless = it)) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = AppleCrimson
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // 32-bit Float Audio Engine
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "32-bit Float Pipeline",
                                color = TextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "Precision internal digital signal processing",
                                color = TextMuted,
                                fontSize = 12.sp
                            )
                        }
                        Switch(
                            checked = settings.float32BitEngine,
                            onCheckedChange = { onUpdateSettings(settings.copy(float32BitEngine = it)) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = AppleCrimson
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Crossfade Slider
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Crossfade Duration",
                                color = TextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "${settings.crossfadeDurationSec.toInt()}s",
                                color = AppleCrimson,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Slider(
                            value = settings.crossfadeDurationSec,
                            onValueChange = { onUpdateSettings(settings.copy(crossfadeDurationSec = it)) },
                            valueRange = 0f..12f,
                            steps = 11,
                            colors = SliderDefaults.colors(
                                thumbColor = AppleCrimson,
                                activeTrackColor = AppleCrimson,
                                inactiveTrackColor = Color.White.copy(alpha = 0.15f)
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Library Scanner
            Text(
                text = "LOCAL LIBRARY",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp)
            )

            LucidGlassCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                backgroundColor = GlassBackground,
                borderColor = GlassBorder
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Scanned $trackCount songs from device storage",
                        color = TextPrimary,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    ElevatedButton(
                        onClick = onRescanLibrary,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.elevatedButtonColors(
                            containerColor = Color.White.copy(alpha = 0.1f),
                            contentColor = TextPrimary
                        )
                    ) {
                        Text(text = "Rescan MediaStore Storage")
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
