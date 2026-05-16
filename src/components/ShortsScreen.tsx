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
          key={video.id || index}
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

          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=0&playsinline=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
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
              {video.title}
            </h2>

            <p className="text-sm opacity-80 mt-1">
              {video.channel}
            </p>

          </div>

        </div>

      ))}

    </div>

  );

};

export default ShortsScreen;
