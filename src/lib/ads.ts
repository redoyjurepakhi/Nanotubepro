import { registerPlugin } from "@capacitor/core";

const AdsPlugin = registerPlugin("AdsPlugin");

export async function showInterstitialAd() {

  try {

    await AdsPlugin.showInterstitial();

  } catch (e) {

    console.warn("Ad failed", e);

  }
}
