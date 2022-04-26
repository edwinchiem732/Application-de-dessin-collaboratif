package com.example.colorimage

import android.app.Activity
import android.util.Log
import android.view.View
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import android.widget.TextView
import android.view.MenuItem
import androidx.appcompat.app.ActionBar
import com.example.colorimage.http.Album
import com.example.colorimage.http.Drawing
import com.example.colorimage.http.HttpService
import com.example.colorimage.http.Room
import com.mocircle.cidrawing.utils.PencilObj
import io.socket.emitter.Emitter
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlin.math.min


object SocketHandler {

    private val gson: Gson = Gson()
    var mSocket: Socket? = null
    val notifications: MutableSet<String> = mutableSetOf()
    val httpService = HttpService.create()




    @Synchronized
    fun setSingletonSocket(useremail: String) {
        try {
            val options: IO.Options =
                IO.Options.builder().setTransports(arrayOf("websocket")).setReconnectionAttempts(2)
                    .setQuery("useremail=${useremail}").build()
            mSocket = IO.socket("https://projet3-3990-207.herokuapp.com/", options)
            if (mSocket!!.id() != null)
                Log.d("WEBSOCKET_COLORIMAGE", "Socket connection establish, socket id: ${mSocket!!.id()}")
        } catch (e: Exception) {
            Log.d("WEBSOCKET_COLORIMAGE", "Failed to connect socket")
        }
    }

    @Synchronized
    fun getSingletonSocket(): Socket? {
        return mSocket
    }


    @Synchronized
    fun establishConnection(userObj: User) {
        mSocket!!.connect().on(Socket.EVENT_CONNECT) {
            Log.i("WEBSOCKET", "EVENT_CONNECT")
            mSocket!!.emit("connection", gson.toJson(userObj)).on("connected") {
                Log.i("WEBSOCKET", "connected FIRST EVENT: ${it[0]}")
            }
        }
    }

    @Synchronized
    fun closeConnection() {
        mSocket!!.disconnect()
    }

}