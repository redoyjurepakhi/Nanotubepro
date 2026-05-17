package com.nanotubepro.hrlabapp;

import android.app.Activity;

import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsLoadOptions;
import com.unity3d.ads.UnityAdsShowOptions;

public class UnityAdsManager {

    private static final String GAME_ID = "6117274";
    private static final String AD_UNIT_ID = "Interstitial_Android";

    public static void initialize(Activity activity) {

        UnityAds.initialize(activity, GAME_ID, false,
            new IUnityAdsInitializationListener() {

                @Override
                public void onInitializationComplete() {
                }

                @Override
                public void onInitializationFailed(
                    UnityAds.UnityAdsInitializationError error,
                    String message
                ) {
                }
            }
        );
    }

    public static void showAd(Activity activity) {

        UnityAds.load(
            AD_UNIT_ID,
            new UnityAdsLoadOptions(),
            new IUnityAdsLoadListener() {

                @Override
                public void onUnityAdsAdLoaded(String placementId) {

                    UnityAds.show(
                        activity,
                        AD_UNIT_ID,
                        new UnityAdsShowOptions(),
                        new IUnityAdsShowListener() {

                            @Override
                            public void onUnityAdsShowFailure(
                                String placementId,
                                UnityAds.UnityAdsShowError error,
                                String message
                            ) {
                            }

                            @Override
                            public void onUnityAdsShowStart(String placementId) {
                            }

                            @Override
                            public void onUnityAdsShowClick(String placementId) {
                            }

                            @Override
                            public void onUnityAdsShowComplete(
                                String placementId,
                                UnityAds.UnityAdsShowCompletionState state
                            ) {
                            }
                        }
                    );
                }

                @Override
                public void onUnityAdsFailedToLoad(
                    String placementId,
                    UnityAds.UnityAdsLoadError error,
                    String message
                ) {
                }
            }
        );
    }
}
