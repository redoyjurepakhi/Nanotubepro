package com.nanotube.model

data class YouTubeResponse(
    val items: List<VideoItem>,
    val nextPageToken: String?
)

data class VideoItem(
    val id: VideoId,
    val snippet: VideoSnippet,
    val statistics: VideoStatistics?
)

data class VideoId(
    val videoId: String?
)

data class VideoSnippet(
    val title: String,
    val description: String,
    val channelTitle: String,
    val publishedAt: String,
    val thumbnails: Thumbnails
)

data class Thumbnails(
    val medium: ThumbnailDetails
)

data class ThumbnailDetails(
    val url: String
)

data class VideoStatistics(
    val viewCount: String,
    val likeCount: String
)
