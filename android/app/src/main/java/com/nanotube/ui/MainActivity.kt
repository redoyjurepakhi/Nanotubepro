package com.nanotube.ui

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.nanotube.R
import com.nanotube.api.YouTubeApiService
import com.nanotube.model.YouTubeResponse
import com.nanotube.ui.adapter.VideoAdapter
import com.nanotube.utils.ApiKeyManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MainActivity : AppCompatActivity() {

    private lateinit var rvVideos: RecyclerView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var adapter: VideoAdapter
    private lateinit var apiKeyManager: ApiKeyManager
    private lateinit var apiService: YouTubeApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        apiKeyManager = ApiKeyManager(this)
        
        val retrofit = Retrofit.Builder()
            .baseUrl("https://www.googleapis.com/youtube/v3/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(YouTubeApiService::class.java)

        rvVideos = findViewById(R.id.rv_videos)
        swipeRefresh = findViewById(R.id.swipe_refresh)

        rvVideos.layoutManager = LinearLayoutManager(this)
        adapter = VideoAdapter(mutableListOf()) { video ->
            val intent = Intent(this, VideoPlayerActivity::class.java)
            intent.putExtra("video_id", video.id.videoId ?: "")
            intent.putExtra("title", video.snippet.title)
            intent.putExtra("channel", video.snippet.channelTitle)
            intent.putExtra("desc", video.snippet.description)
            startActivity(intent)
        }
        rvVideos.adapter = adapter

        findViewById<ImageButton>(R.id.btn_search).setOnClickListener {
            startActivity(Intent(this, SearchActivity::class.java))
        }

        findViewById<com.google.android.material.bottomnavigation.BottomNavigationView>(R.id.bottom_nav)
            .setOnItemSelectedListener { item ->
                when (item.itemId) {
                    R.id.nav_home -> {
                        loadTrendingVideos()
                        true
                    }
                    R.id.nav_settings -> {
                        startActivity(Intent(this, SettingsActivity::class.java))
                        true
                    }
                    else -> false
                }
            }

        swipeRefresh.setOnRefreshListener { loadTrendingVideos() }

        loadTrendingVideos()
    }

    private fun loadTrendingVideos() {
        val apiKey = apiKeyManager.getNextKey()
        if (apiKey == null) {
            Toast.makeText(this, "Please add API Key in Settings", Toast.LENGTH_LONG).show()
            swipeRefresh.isRefreshing = false
            return
        }

        apiService.getTrendingVideos(apiKey = apiKey).enqueue(object : Callback<YouTubeResponse> {
            override fun onResponse(call: Call<YouTubeResponse>, response: Response<YouTubeResponse>) {
                swipeRefresh.isRefreshing = false
                if (response.isSuccessful) {
                    response.body()?.let { adapter.updateData(it.items) }
                } else if (response.code() == 403) {
                    // Quota exceeded or invalid key
                    apiKeyManager.rotateKey()
                    loadTrendingVideos() // Retry with next key
                }
            }

            override fun onFailure(call: Call<YouTubeResponse>, t: Throwable) {
                swipeRefresh.isRefreshing = false
                Toast.makeText(this@MainActivity, "Network Error", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
