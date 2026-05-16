import React from "react";

interface ShortsScreenProps {
  videos: any[];
}

const ShortsScreen: React.FC<ShortsScreenProps> = ({ videos }) => {

  return (

    <div
      className="
        h-full
        overflow-y-scroll
        snap-y
        snap-mandatory
        bg-black
      "
    >

      {videos.map((video, index) => (

        <div
          key={video?.id?.videoId || index}
          className="
            h-screen
            w-full
            snap-start
            relative
            flex
            items-center
            justify-center
            bg-black
            overflow-hidden
          "
        >

          <img
            src={
              video?.snippet?.thumbnails?.maxres?.url ||
              video?.snippet?.thumbnails?.high?.url ||
              video?.snippet?.thumbnails?.medium?.url ||
              video?.snippet?.thumbnails?.default?.url
            }
            className="w-full h-full object-cover"
            alt={video?.snippet?.title || "Short"}
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/80
              via-transparent
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-24
              left-4
              right-4
              text-white
              z-10
            "
          >

            <h2 className="font-bold text-lg line-clamp-2">
              {video?.snippet?.title || "Untitled Video"}
            </h2>

            <p className="text-sm opacity-80 mt-1">
              {video?.snippet?.channelTitle || "Unknown Channel"}
            </p>

          </div>

        </div>

      ))}

    </div>

  );

};

export default ShortsScreen;
