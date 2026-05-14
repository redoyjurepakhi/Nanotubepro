let lastAdTime = 0;

export const showInterstitialAd = () => {
  const now = Date.now();

  // Prevent spam ads (2 minute cooldown)
  if (now - lastAdTime < 120000) {
    return;
  }

  lastAdTime = now;

  try {
    window.open(
      "https://www.profitablecpmratenetwork.com/zr7fj5wb7f?key=96ea393df60638f4aceefc7796125488",
      "_blank"
    );
  } catch (e) {
    console.warn("Ad error:", e);
  }
};
