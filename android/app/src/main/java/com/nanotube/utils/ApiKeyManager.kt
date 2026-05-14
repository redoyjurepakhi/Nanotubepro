package com.nanotube.utils

import android.content.Context
import android.content.SharedPreferences

class ApiKeyManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("api_keys", Context.MODE_PRIVATE)
    private var keys: MutableList<String> = mutableListOf()
    private var currentIndex = 0

    init {
        loadKeys()
    }

    private fun loadKeys() {
        val keysString = prefs.getString("keys", "") ?: ""
        if (keysString.isNotEmpty()) {
            keys = keysString.split(",").map { it.trim() }.toMutableList()
        }
    }

    fun setKeys(keysString: String) {
        prefs.edit().putString("keys", keysString).apply()
        loadKeys()
    }

    fun getKeysString(): String {
        return keys.joinToString(", ")
    }

    fun getNextKey(): String? {
        if (keys.isEmpty()) return null
        val key = keys[currentIndex]
        currentIndex = (currentIndex + 1) % keys.size
        return key
    }

    fun rotateKey(): String? {
        if (keys.isEmpty()) return null
        currentIndex = (currentIndex + 1) % keys.size
        return keys[currentIndex]
    }
    
    fun hasKeys(): Boolean = keys.isNotEmpty()
}
