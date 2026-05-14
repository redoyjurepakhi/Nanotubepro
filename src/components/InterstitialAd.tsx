import { useEffect, useState } from "react";
import { SMARTLINK_URL } from "../adManager";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ads = [
  "/intads/ad1.jpg",
  "/intads/ad2.jpg",
  "/intads/ad3.jpg",
];

export default function InterstitialAd({
  open,
  onClose,
}: Props) {

  const [countdown, setCountdown] = useState(5);

  const [selectedAd, setSelectedAd] = useState("");

  useEffect(() => {

    if (!open) return;

    const randomAd =
      ads[Math.floor(Math.random() * ads.length)];

    setSelectedAd(randomAd);

    setCountdown(5);

    const timer = setInterval(() => {

      setCountdown((prev) => {

        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });

    }, 1000);

    return () => clearInterval(timer);

  }, [open]);

  if (!open) return null;

  return (

    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
    >

      <div
        className="bg-[#111] rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl"
      >

        <div className="p-3 text-center text-white text-sm">
          Sponsored
        </div>

        <img
          src={selectedAd}
          alt="Advertisement"
          className="w-full object-cover cursor-pointer"
          onClick={() => {
            window.open(SMARTLINK_URL, "_blank");
          }}
        />

        <div className="p-4">

          {countdown > 0 ? (

            <button
              disabled
              className="w-full bg-gray-700 text-white py-3 rounded-xl"
            >
              Continue in {countdown}s
            </button>

          ) : (

            <button
              onClick={onClose}
              className="w-full bg-red-600 text-white py-3 rounded-xl"
            >
              Continue to App
            </button>

          )}

        </div>

      </div>

    </div>

  );
}
