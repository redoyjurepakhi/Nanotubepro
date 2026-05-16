const ShortVideo = ({ video, isActive }: { video: any, isActive: boolean }) => {

  const videoId =
    typeof video.id === "string"
      ? video.id
      : video.id?.videoId;

  const snippet = video.snippet || {};

  return (

    <div
      className="
        relative
        w-full
        h-screen
        snap-start
        flex
        justify-center
        items-center
        bg-black
        overflow-hidden
      "
    >

      {/* VIDEO PLAYER */}

      {isActive ? (

        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
          title={snippet.title || "Short Video"}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

      ) : (

        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={snippet.title || "Short"}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            opacity-70
          "
        />

      )}

      {/* DARK OVERLAY */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/80
          via-transparent
          to-transparent
          pointer-events-none
        "
      />

      {/* RIGHT SIDE BUTTONS */}

      <div
        className="
          absolute
          right-4
          bottom-24
          flex
          flex-col
          items-center
          gap-5
          z-10
        "
      >

        <button className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full">
            <ThumbsUp
              fill="currentColor"
              className="w-6 h-6 text-white"
            />
          </div>

          <span className="text-white text-xs mt-1">
            Like
          </span>
        </button>

        <button className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full">
            <MessageSquare
              fill="currentColor"
              className="w-6 h-6 text-white"
            />
          </div>

          <span className="text-white text-xs mt-1">
            Comment
          </span>
        </button>

        <button className="flex flex-col items-center">
          <div className="p-3 bg-black/40 rounded-full">
            <Share2 className="w-6 h-6 text-white" />
          </div>

          <span className="text-white text-xs mt-1">
            Share
          </span>
        </button>

      </div>

      {/* BOTTOM INFO */}

      <div
        className="
          absolute
          bottom-20
          left-4
          right-20
          z-10
          text-white
        "
      >

        <div className="flex items-center gap-3 mb-3">

          <div
            className="
              w-10
              h-10
              rounded-full
              bg-zinc-700
              flex
              items-center
              justify-center
            "
          >

            <User className="w-5 h-5 text-white" />

          </div>

          <span className="font-semibold text-sm">
            @{(snippet.channelTitle || "channel").replace(/\s+/g, "")}
          </span>

          <button
            className="
              bg-white
              text-black
              px-3
              py-1
              rounded-full
              text-sm
              font-semibold
            "
          >
            Subscribe
          </button>

        </div>

        <h2 className="font-semibold text-sm line-clamp-2">
          {snippet.title || "Untitled Short"}
        </h2>

        <div className="flex items-center gap-2 mt-2">

          <Music className="w-4 h-4" />

          <span className="text-xs opacity-90 truncate">
            Original Sound - {snippet.channelTitle || "Unknown"}
          </span>

        </div>

      </div>

    </div>

  );

};

export default ShortsScreen;
