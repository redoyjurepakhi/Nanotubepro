package com.nanotube.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.nanotube.R
import com.nanotube.model.VideoItem

class VideoAdapter(
    private var videos: MutableList<VideoItem>,
    private val onItemClick: (VideoItem) -> Unit
) : RecyclerView.Adapter<VideoAdapter.VideoViewHolder>() {

    class VideoViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val thumbnail: ImageView = view.findViewById(R.id.iv_thumbnail)
        val title: TextView = view.findViewById(R.id.tv_title)
        val channel: TextView = view.findViewById(R.id.tv_channel)
        val meta: TextView = view.findViewById(R.id.tv_meta)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VideoViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_video, parent, false)
        return VideoViewHolder(view)
    }

    override fun onBindViewHolder(holder: VideoViewHolder, position: Int) {
        val video = videos[position]
        holder.title.text = video.snippet.title
        holder.channel.text = video.snippet.channelTitle
        holder.meta.text = "${video.snippet.publishedAt.take(10)}" // Simple date format

        Glide.with(holder.itemView.context)
            .load(video.snippet.thumbnails.medium.url)
            .placeholder(R.drawable.ic_launcher_background)
            .into(holder.thumbnail)

        holder.itemView.setOnClickListener { onItemClick(video) }
    }

    override fun getItemCount(): Int = videos.size

    fun updateData(newVideos: List<VideoItem>) {
        videos.clear()
        videos.addAll(newVideos)
        notifyDataSetChanged()
    }
}
