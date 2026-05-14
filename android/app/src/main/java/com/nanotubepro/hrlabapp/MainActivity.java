package com.nanotubepro.hrlabapp;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = this.bridge.getWebView();

        WebSettings settings = webView.getSettings();

        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDomStorageEnabled(true);
        settings.setJavaScriptEnabled(true);
    }

    @Override
    public void onPause() {
        // Do NOT pause WebView audio/video
    }

    @Override
    public void onResume() {
        super.onResume();
    }
}
