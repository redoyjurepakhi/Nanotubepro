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
          key={video.id?.videoId || index}
          className="
            h-screen
            w-full
            snap-start
            relative
            flex
            items-center
            justify-center
            bg-black
          "
        >

          <img
  src={video.snippet?.thumbnails?.high?.url}
  className="w-full h-full object-cover"
  alt={video.snippet?.title}
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
              {video.snippet?.title}
            </h2>

            <p className="text-sm opacity-80 mt-1">
              {video.snippet?.channelTitle}
            </p>

          </div>

        </div>

      ))}

    </div>

  );

};

export default ShortsScreen;
