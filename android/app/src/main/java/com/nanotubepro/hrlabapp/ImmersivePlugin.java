package com.nanotubepro.hrlabapp;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "Immersive")
public class ImmersivePlugin extends Plugin {

    @PluginMethod
    public void enable(PluginCall call) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {

            if (getActivity().getWindow().getInsetsController() != null) {

                getActivity().getWindow().getInsetsController().hide(
                    WindowInsets.Type.statusBars()
                    | WindowInsets.Type.navigationBars()
                );

                getActivity().getWindow().getInsetsController().setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }

        } else {

            getActivity().getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );

        }

        call.resolve();
    }

    @PluginMethod
    public void disable(PluginCall call) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {

            if (getActivity().getWindow().getInsetsController() != null) {

                getActivity().getWindow().getInsetsController().show(
                    WindowInsets.Type.statusBars()
                    | WindowInsets.Type.navigationBars()
                );
            }

        } else {

            getActivity().getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );

        }

        call.resolve();
    }
}
