package com.nanotube.ui

import android.content.Intent
import android.os.Bundle
import android.view.animation.AlphaAnimation
import androidx.appcompat.app.AppCompatActivity
import com.nanotube.R
import android.view.View

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        val root = findViewById<View>(android.R.id.content)
        val fadeIn = AlphaAnimation(0.0f, 1.0f)
        fadeIn.duration = 1000
        root.startAnimation(fadeIn)

        root.postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }, 2000)
    }
}
