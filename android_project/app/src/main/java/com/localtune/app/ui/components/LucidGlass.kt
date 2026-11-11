package com.localtune.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localtune.app.ui.theme.GlassBackground
import com.localtune.app.ui.theme.GlassBorder
import com.localtune.app.ui.theme.GlassBorderSpecular
import com.localtune.app.ui.theme.LosslessGold

fun Modifier.lucidGlass(
    shape: Shape = RoundedCornerShape(16.dp),
    backgroundColor: Color = GlassBackground,
    borderColor: Color = GlassBorder,
    borderWidth: Dp = 1.dp
): Modifier = this
    .clip(shape)
    .background(backgroundColor)
    .border(
        width = borderWidth,
        brush = Brush.verticalGradient(
            colors = listOf(
                GlassBorderSpecular,
                borderColor
            )
        ),
        shape = shape
    )

@Composable
fun LucidGlassCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(20.dp),
    backgroundColor: Color = GlassBackground,
    borderColor: Color = GlassBorder,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier
            .shadow(elevation = 12.dp, shape = shape, spotColor = Color.Black.copy(alpha = 0.6f))
            .lucidGlass(
                shape = shape,
                backgroundColor = backgroundColor,
                borderColor = borderColor
            ),
        content = content
    )
}

@Composable
fun LosslessBadge(
    modifier: Modifier = Modifier,
    isHiRes: Boolean = false,
    formatText: String = "LOSSLESS"
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(if (isHiRes) LosslessGold.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.12f))
            .border(
                width = 0.5.dp,
                color = if (isHiRes) LosslessGold.copy(alpha = 0.4f) else Color.White.copy(alpha = 0.25f),
                shape = RoundedCornerShape(6.dp)
            )
            .padding(horizontal = 6.dp, vertical = 2.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = formatText.uppercase(),
            color = if (isHiRes) LosslessGold else Color.White.copy(alpha = 0.85f),
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp
        )
    }
}
