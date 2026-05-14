package com.nanotube.ui

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.nanotube.R
import com.nanotube.utils.ApiKeyManager

class SettingsActivity : AppCompatActivity() {

    private lateinit var etApiKeys: EditText
    private lateinit var btnSave: Button
    private lateinit var apiKeyManager: ApiKeyManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Note: activity_settings.xml needs to be created
        setContentView(R.layout.activity_settings)

        apiKeyManager = ApiKeyManager(this)

        etApiKeys = findViewById(R.id.et_api_keys)
        btnSave = findViewById(R.id.btn_save)

        etApiKeys.setText(apiKeyManager.getKeysString())

        btnSave.setOnClickListener {
            val keys = etApiKeys.text.toString()
            if (keys.isNotEmpty()) {
                apiKeyManager.setKeys(keys)
                Toast.makeText(this, "Keys Saved", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }
}
