package com.localtune.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.localtune.app.R
import com.localtune.app.ui.theme.AppleCrimson
import com.localtune.app.ui.theme.DarkSurface
import com.localtune.app.ui.theme.GlassBorder
import com.localtune.app.ui.theme.TextMuted

enum class NavigationTab(val title: String, val iconRes: Int) {
    LISTEN_NOW("Listen Now", R.drawable.ic_listen_now),
    LIBRARY("Library", R.drawable.ic_library),
    SEARCH("Search", R.drawable.ic_search)
}

@Composable
fun AppleBottomTabBar(
    selectedTab: NavigationTab,
    onTabSelected: (NavigationTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .lucidGlass(
                shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp),
                backgroundColor = DarkSurface.copy(alpha = 0.85f),
                borderColor = GlassBorder
            )
            .navigationBarsPadding()
            .height(60.dp)
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        for (tab in NavigationTab.values()) {
            val isSelected = tab == selectedTab
            val interactionSource = remember { MutableInteractionSource() }

            Column(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .clickable(
                        interactionSource = interactionSource,
                        indication = null,
                        onClick = { onTabSelected(tab) }
                    )
                    .padding(horizontal = 20.dp, vertical = 6.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    painter = painterResource(id = tab.iconRes),
                    contentDescription = tab.title,
                    tint = if (isSelected) AppleCrimson else TextMuted,
                    modifier = Modifier.size(22.dp)
                )

                Text(
                    text = tab.title,
                    color = if (isSelected) AppleCrimson else TextMuted,
                    fontSize = 11.sp,
                    fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                    modifier = Modifier.padding(top = 3.dp)
                )
            }
        }
    }
}
