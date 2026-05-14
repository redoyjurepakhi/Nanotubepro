package com.nanotube.api

import com.nanotube.model.YouTubeResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Query

interface YouTubeApiService {
    @GET("videos")
    fun getTrendingVideos(
        @Query("part") part: String = "snippet,statistics",
        @Query("chart") chart: String = "mostPopular",
        @Query("maxResults") maxResults: Int = 20,
        @Query("regionCode") regionCode: String = "US",
        @Query("key") apiKey: String
    ): Call<YouTubeResponse>

    @GET("search")
    fun searchVideos(
        @Query("part") part: String = "snippet",
        @Query("q") query: String,
        @Query("type") type: String = "video",
        @Query("maxResults") maxResults: Int = 20,
        @Query("key") apiKey: String
    ): Call<YouTubeResponse>
}
