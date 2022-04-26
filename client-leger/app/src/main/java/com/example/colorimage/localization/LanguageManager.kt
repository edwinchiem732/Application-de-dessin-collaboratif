package com.example.colorimage.localization

import android.content.Context
import android.content.SharedPreferences
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import java.util.*

class LanguageManager(ctx: Context) {

    var context: Context = ctx
    var sharedPreferences: SharedPreferences? = null
    var localizedContext: Context? = null

    init {
        sharedPreferences = context.getSharedPreferences("language", Context.MODE_PRIVATE)
    }

    @RequiresApi(Build.VERSION_CODES.N)
    fun updateResource(code: String){
        Locale.setDefault(Locale(code))
        context.resources.configuration.setLocale(Locale(code))
        localizedContext = context.createConfigurationContext(context.resources.configuration)
        Log.i("hello", context.resources.configuration.locales.toString())
        setLang(code)
    }



    fun getLocalizedResources(context: Context, desiredLocale: Locale?): Resources? {
        var conf: Configuration = context.resources.configuration
        conf = Configuration(conf)
        conf.setLocale(desiredLocale)
        val localizedContext = context.createConfigurationContext(conf)
        return localizedContext.resources
    }



    fun getLang(): String {
        return sharedPreferences!!.getString("lang", "en")!!
    }

    fun setLang(code: String) {
        val editor: SharedPreferences.Editor = sharedPreferences!!.edit()
        editor.putString("lang", code)
        editor.apply()
    }

}