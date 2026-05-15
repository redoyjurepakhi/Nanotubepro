package com.nanotubepro.hrlabapp;

import android.app.PictureInPictureParams;
import android.os.Build;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private boolean isVideoPlaying() {

        WebView webView = this.bridge.getWebView();

        String js =
            "(function() {" +
            "const v = document.querySelector('video');" +
            "return v && !v.paused;" +
            "})()";

        return true;
    }

    private void enterPiP() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            PictureInPictureParams params =
                new PictureInPictureParams.Builder().build();

            enterPictureInPictureMode(params);
        }
    }

    @Override
    public void onUserLeaveHint() {
        super.onUserLeaveHint();

        enterPiP();
    }

    @Override
    public void onBackPressed() {

        if (isVideoPlaying()) {

            enterPiP();

        } else {

            super.onBackPressed();

        }
    }
}
