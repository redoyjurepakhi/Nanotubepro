package com.nanotube.ui

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.nanotube.R
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView

class VideoPlayerActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_video_player)

        val videoId = intent.getStringExtra("video_id") ?: ""
        val title = intent.getStringExtra("title") ?: ""
        val channel = intent.getStringExtra("channel") ?: ""
        val desc = intent.getStringExtra("desc") ?: ""

        val playerView = findViewById<YouTubePlayerView>(R.id.youtube_player_view)
        lifecycle.addObserver(playerView)

        playerView.addYouTubePlayerListener(object : AbstractYouTubePlayerListener() {
            override fun onReady(youTubePlayer: YouTubePlayer) {
                youTubePlayer.loadVideo(videoId, 0f)
            }
        })

        findViewById<TextView>(R.id.tv_video_title).text = title
        findViewById<TextView>(R.id.tv_channel_name).text = channel
        findViewById<TextView>(R.id.tv_description).text = desc
    }
}
