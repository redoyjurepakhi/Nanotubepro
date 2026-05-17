package com.nanotubepro.hrlabapp;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "AdsPlugin")
public class AdsPlugin extends Plugin {

    @PluginMethod
    public void showInterstitial(PluginCall call) {

        getActivity().runOnUiThread(() -> {
            UnityAdsManager.showAd(getActivity());
        });

        call.resolve();
    }
}
