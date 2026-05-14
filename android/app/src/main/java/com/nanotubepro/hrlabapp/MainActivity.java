package com.nanotubepro.hrlabapp;

import android.app.PictureInPictureParams;
import android.os.Build;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onUserLeaveHint() {
        super.onUserLeaveHint();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            PictureInPictureParams params =
                new PictureInPictureParams.Builder().build();

            enterPictureInPictureMode(params);
        }
    }
}
