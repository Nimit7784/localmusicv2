package com.localtune.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localtune.app.R
import com.localtune.app.model.AudioTrack
import com.localtune.app.ui.components.LucidGlassCard
import com.localtune.app.ui.components.TrackItemView
import com.localtune.app.ui.components.lucidGlass
import com.localtune.app.ui.theme.AppleCrimson
import com.localtune.app.ui.theme.GlassBackground
import com.localtune.app.ui.theme.GlassBorder
import com.localtune.app.ui.theme.TextMuted
import com.localtune.app.ui.theme.TextPrimary
import com.localtune.app.ui.theme.TextSecondary

@Composable
fun SearchScreen(
    tracks: List<AudioTrack>,
    currentTrack: AudioTrack?,
    onTrackClick: (AudioTrack) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }

    val filteredTracks = remember(searchQuery, tracks) {
        if (searchQuery.isBlank()) {
            emptyList()
        } else {
            tracks.filter {
                it.title.contains(searchQuery, ignoreCase = true) ||
                it.artist.contains(searchQuery, ignoreCase = true) ||
                it.album.contains(searchQuery, ignoreCase = true)
            }
        }
    }

    val genres = listOf(
        "Hi-Res Audio" to Color(0xFFE50914),
        "Rock & Metal" to Color(0xFF6B46C1),
        "Electronic" to Color(0xFF0070F3),
        "Classical" to Color(0xFFD97706),
        "Jazz & Blues" to Color(0xFF059669),
        "Acoustic" to Color(0xFF8B5CF6)
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 120.dp)
    ) {
        item {
            Text(
                text = "Search",
                color = TextPrimary,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
            )
        }

        // Search text field
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
                    .lucidGlass(
                        shape = RoundedCornerShape(12.dp),
                        backgroundColor = GlassBackground,
                        borderColor = GlassBorder
                    )
                    .padding(horizontal = 14.dp, vertical = 12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_search),
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(18.dp)
                    )

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .padding(start = 10.dp)
                    ) {
                        if (searchQuery.isEmpty()) {
                            Text(
                                text = "Artists, Songs, Lyrics, and More",
                                color = TextMuted,
                                fontSize = 15.sp
                            )
                        }
                        BasicTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            textStyle = TextStyle(
                                color = TextPrimary,
                                fontSize = 15.sp
                            ),
                            cursorBrush = SolidColor(AppleCrimson),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        if (searchQuery.isNotEmpty()) {
            if (filteredTracks.isEmpty()) {
                item {
                    Text(
                        text = "No results found for \"$searchQuery\"",
                        color = TextMuted,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 20.dp)
                    )
                }
            } else {
                items(filteredTracks, key = { it.id }) { track ->
                    TrackItemView(
                        track = track,
                        isPlayingThis = track.id == currentTrack?.id,
                        onClick = { onTrackClick(track) },
                        modifier = Modifier.padding(horizontal = 10.dp)
                    )
                }
            }
        } else {
            // Genre tiles
            item {
                Text(
                    text = "Explore Categories",
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                )
            }

            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    for (rowGenres in genres.chunked(2)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            for ((title, color) in rowGenres) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .aspectRatio(1.8f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(color.copy(alpha = 0.6f))
                                        .clickable { searchQuery = title }
                                        .padding(14.dp),
                                    contentAlignment = Alignment.BottomStart
                                ) {
                                    Text(
                                        text = title,
                                        color = Color.White,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
