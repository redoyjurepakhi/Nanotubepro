import React from "react";

interface ShortsScreenProps {
  videos: any[];
  onVideoSelect?: (video: any) => void;
}

const ShortsScreen: React.FC<ShortsScreenProps> = ({
  videos,
  onVideoSelect
}) => {

  const shortsVideos = videos;

  return (

    <div className="h-full overflow-y-auto bg-black pb-24">

      <div className="grid grid-cols-2 gap-2 p-2">

        {shortsVideos.map((video, index) => (

          <div
            key={video?.id?.videoId || index}
            onClick={() => onVideoSelect?.(video)}
            className="
              relative
              rounded-xl
              overflow-hidden
              bg-zinc-900
              cursor-pointer
            "
          >

            <div className="aspect-[9/16] relative">

              <img
                src={
                  video?.snippet?.thumbnails?.maxres?.url ||
                  video?.snippet?.thumbnails?.high?.url ||
                  video?.snippet?.thumbnails?.medium?.url ||
                  video?.snippet?.thumbnails?.default?.url
                }
                alt={video?.snippet?.title || "Short"}
                className="
                  w-full
                  h-full
                  object-cover
                "
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
                  bottom-2
                  left-2
                  right-2
                  text-white
                "
              >

                <h2
                  className="
                    text-sm
                    font-semibold
                    line-clamp-2
                  "
                >
                  {video?.snippet?.title || "Untitled"}
                </h2>

                <p
                  className="
                    text-xs
                    opacity-80
                    mt-1
                  "
                >
                  {video?.snippet?.channelTitle ||
                    "Unknown Channel"}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ShortsScreen;
