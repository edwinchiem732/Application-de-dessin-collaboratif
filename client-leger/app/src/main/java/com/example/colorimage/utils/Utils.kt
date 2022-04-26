package com.example.colorimage.utils

import android.util.Patterns

object Utils {

    // Check if the format of email is valid
    fun isEmailFormatValid(email: String): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}