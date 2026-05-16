import React from "react";

const ShortsScreen: React.FC = () => {

  return (

    <div className="w-full h-full bg-black overflow-hidden">

      <iframe
        src="https://m.youtube.com/shorts"
        title="NanoTube Shorts"
        className="w-full h-full border-0"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />

    </div>

  );

};

export default ShortsScreen;
