package com.nanotube.ui

import android.content.Intent
import android.os.Bundle
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
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

class SearchActivity : AppCompatActivity() {

    private lateinit var etSearch: EditText
    private lateinit var rvResults: RecyclerView
    private lateinit var adapter: VideoAdapter
    private lateinit var apiKeyManager: ApiKeyManager
    private lateinit var apiService: YouTubeApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search)

        apiKeyManager = ApiKeyManager(this)
        apiService = Retrofit.Builder()
            .baseUrl("https://www.googleapis.com/youtube/v3/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(YouTubeApiService::class.java)

        etSearch = findViewById(R.id.et_search)
        rvResults = findViewById(R.id.rv_search_results)

        rvResults.layoutManager = LinearLayoutManager(this)
        adapter = VideoAdapter(mutableListOf()) { video ->
            val intent = Intent(this, VideoPlayerActivity::class.java)
            intent.putExtra("video_id", video.id.videoId ?: "")
            intent.putExtra("title", video.snippet.title)
            startActivity(intent)
        }
        rvResults.adapter = adapter

        etSearch.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                performSearch(etSearch.text.toString())
                hideKeyboard()
                true
            } else false
        }
    }

    private fun performSearch(query: String) {
        val apiKey = apiKeyManager.getNextKey() ?: return
        apiService.searchVideos(query = query, apiKey = apiKey).enqueue(object : Callback<YouTubeResponse> {
            override fun onResponse(call: Call<YouTubeResponse>, response: Response<YouTubeResponse>) {
                if (response.isSuccessful) {
                    response.body()?.let { adapter.updateData(it.items) }
                }
            }
            override fun onFailure(call: Call<YouTubeResponse>, t: Throwable) {
                Toast.makeText(this@SearchActivity, "Search failed", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun hideKeyboard() {
        val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(etSearch.windowToken, 0)
    }
}
