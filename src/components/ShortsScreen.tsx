import React from "react";

const ShortsScreen: React.FC = () => {

  const openShorts = () => {
    window.open(
      "https://m.youtube.com/shorts",
      "_self"
    );
  };

  return (

    <div
      className="
        w-full
        h-full
        bg-black
        flex
        items-center
        justify-center
        px-6
      "
    >

      <button
        onClick={openShorts}
        className="
          bg-red-600
          text-white
          px-8
          py-4
          rounded-2xl
          text-xl
          font-bold
          active:scale-95
        "
      >

        Open YouTube Shorts

      </button>

    </div>

  );

};

export default ShortsScreen;
