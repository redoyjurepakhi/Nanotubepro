package com.nanotubepro.hrlabapp;
import com.nanotubepro.hrlabapp.ImmersivePlugin;
import android.app.PictureInPictureParams;
import android.os.Build;
import android.webkit.WebView;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import com.getcapacitor.Plugin;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    public void enableImmersiveMode() {
    
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
    
                if (getWindow().getInsetsController() != null) {
    
                    getWindow().getInsetsController().hide(
                        WindowInsets.Type.statusBars()
                        | WindowInsets.Type.navigationBars()
                    );
    
                    getWindow().getInsetsController().setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                    );
                }
    
            } else {
    
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                );
    
            }
        }
    
        public void disableImmersiveMode() {
    
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
    
                if (getWindow().getInsetsController() != null) {
    
                    getWindow().getInsetsController().show(
                        WindowInsets.Type.statusBars()
                        | WindowInsets.Type.navigationBars()
                    );
                }
    
            } else {
    
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                );
    
            }
        }

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
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    
        UnityAdsManager.initialize(this);
    }

    @Override
        public void onStart() {
    
            super.onStart();
    
            registerPlugin(ImmersivePlugin.class);
    
        }
        
}
