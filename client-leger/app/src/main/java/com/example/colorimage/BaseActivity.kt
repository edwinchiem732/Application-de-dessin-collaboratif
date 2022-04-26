package com.example.colorimage

import android.app.AlertDialog
import android.content.Intent
import android.content.SharedPreferences
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.LifecycleObserver
import com.example.colorimage.albums.AlbumsActivity
import com.example.colorimage.http.*
import com.example.colorimage.localization.LanguageManager
import com.example.colorimage.profile.ProfileActivity
import com.google.gson.Gson
import io.socket.emitter.Emitter
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

open class BaseActivity : AppCompatActivity(), LifecycleObserver {

    var albumsListBase: MutableList<Album> =  mutableListOf()
    var chatNotificationsTV: TextView? = null
    lateinit var languageManager: LanguageManager

    var httpService = HttpService.create()


    companion object {
        var currentRoom = ""
        var joinedDrawings = mutableSetOf<String>()
    }


    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {
        languageManager = LanguageManager(this)
        languageManager.updateResource(languageManager.getLang())
        Log.i("theme", readSharedPrefInt("theme").toString())
        setTheme(readSharedPrefInt("theme")!!)
        super.onCreate(savedInstanceState)
        SocketHandler.getSingletonSocket()?.on("MSG", onUpdateChat)
        runBlocking {
            launch {
                updateAlbumsList(false)
            }
        }
        setAlbumsEvents()



    }

    private fun setAlbumsEvents() {
        SocketHandler.mSocket?.on("ALBUMMODIFIED") { event ->
            val jsonString = event[0].toString()
            val albumModified = Gson().fromJson(jsonString, AlbumModified::class.java)
            val album = (if (this is AlbumsActivity) adapter.albumsList else albumsListBase).find { it.albumName == albumModified.album.albumName}
            val requests = album!!.requests!!.toSet()
            val modifiedRequest = albumModified.album.requests!!.toSet()
//            val diffList = requests.minus(modifiedRequest)
            val diffList = modifiedRequest.minus(requests)
//            val cond = modifiedRequest.any { requests.contains(it) }
            if (diffList.isNotEmpty() && albumModified.album.members!!.contains(readSharedPref("useremail"))) {
                openAcceptRequestAlbumPrompt(modifiedRequest.toTypedArray(), albumModified.album.albumName)
            }
            (if (this is AlbumsActivity) adapter.albumsList else albumsListBase).removeAll { it.albumName == albumModified.album.albumName }
            (if (this is AlbumsActivity) adapter.albumsList else albumsListBase).add(albumModified.album)
            runOnUiThread {
                if(this is AlbumsActivity) {
                    adapter.notifyDataSetChanged()
                }
            }

        }
        SocketHandler.mSocket?.on("ALBUMCREATED") {
            val jsonString = it[0].toString()
            runBlocking {
                launch {
                    updateAlbumsList()
                }
            }
        }
        SocketHandler.mSocket?.on("ALBUMDELETED") {
            val jsonString = it[0].toString()
            runBlocking {
                launch {
                    updateAlbumsList()
                }
            }
        }
    }

    private fun openAcceptRequestAlbumPrompt(requestList: Array<String>, albumName: String) {
        runOnUiThread {
            val alertDialog = AlertDialog.Builder(this)

            alertDialog.setTitle(getStr(R.string.choose_to_accept, albumName))
            alertDialog.setItems(requestList) { dialog, which ->
                runBlocking {
                    launch {
                        val acceptRequest = AcceptRequestAlbum(
                            readSharedPref("useremail")!!,
                            requestList[which],
                            albumName
                        )
                        val x = httpService.acceptRequestAlbum(acceptRequest)
                        dialog.cancel()
                    }
                }

            }
            val alert = alertDialog.create()
            alert.setCanceledOnTouchOutside(true)
            if(!isFinishing) alert.show()

        }
    }

    fun getAlbumList(isForAdapter: Boolean) = if (this is AlbumsActivity && isForAdapter) adapter.albumsList else albumsListBase

    suspend fun updateAlbumsList (isForAdapter: Boolean = true) {

            if (this is AlbumsActivity && isForAdapter) {
                adapter.albumsList = httpService.getAllAlbums()!!
            } else {
                albumsListBase = httpService.getAllAlbums()!!
            }
        val publicAlbum = getAlbumList(isForAdapter).find { it.albumName == "PUBLIC"}
        getAlbumList(isForAdapter).removeAll { it.albumName == "PUBLIC" }
        Log.i("test_album", getAlbumList(isForAdapter).toString())
        getAlbumList(isForAdapter).add(0, publicAlbum!!)
        runOnUiThread {
            if(this is AlbumsActivity && isForAdapter) {
                adapter.notifyDataSetChanged()
            }
        }
    }


    private fun isMember(album: Album) = readSharedPref("useremail") in album.members!!


    private fun getStr(str: Int, arg: String?): String {
        return if (arg != null) {
            languageManager.localizedContext!!.getString(str, arg)
        } else {
            languageManager.localizedContext!!.getString(str)
        }
    }


    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        if (this is RegisterActivity) return true
        menuInflater.inflate(R.menu.main_menu, menu)
        val chatItem = menu.findItem(R.id.chat_icon)
//        val profileItem = menu.findItem(R.id.profile)
        val logoutItem = menu.findItem(R.id.logout)

        if (this is MainActivity || this is RegisterActivity) {
            chatItem!!.isVisible = false
//            profileItem!!.isVisible = false
            logoutItem!!.isVisible = false
        }

        val actionView = chatItem.actionView
        chatNotificationsTV = actionView.findViewById<View>(R.id.chat_icon_TV) as TextView
        updateBadge()
        return true
    }

    override fun  onPrepareOptionsMenu (menu: Menu): Boolean {
        if (this is RegisterActivity) return true
        updateBadge()
        return true
    }


    fun readSharedPref(key: String): String? {
        return getSharedPreferences("myAppPrefs", MODE_PRIVATE).getString(key, null)
    }

    fun readSharedPrefInt(key: String): Int? {
        return getSharedPreferences("myAppPrefs", MODE_PRIVATE).getInt(key, R.style.Theme_Colorimage)
    }

    fun readSharedPrefArray(arrayName: String): ArrayList<String> {
        return getArrayPrefs(arrayName)
    }

    open fun setArrayPrefs(arrayName: String, array: ArrayList<String>) {
        val prefs: SharedPreferences = getSharedPreferences("myAppPrefs", MODE_PRIVATE)
        val editor: SharedPreferences.Editor = prefs.edit()
        editor.putInt(arrayName + "_size", array.size)
        for (i in 0 until array.size) editor.putString(arrayName + "_" + i, array[i])
        editor.apply()
    }

    open fun getArrayPrefs(arrayName: String): ArrayList<String> {
        val prefs: SharedPreferences = getSharedPreferences("myAppPrefs", MODE_PRIVATE)
        val size: Int = prefs.getInt(arrayName + "_size", 0)
        val array: ArrayList<String> = ArrayList(size)
        for (i in 0 until size) prefs.getString(arrayName + "_" + i, null)?.let { array.add(it) }
        return array
    }

    override fun onStart() {
        super.onStart()
        invalidateOptionsMenu()
    }

    private fun addNotification(eventName: String) {
        SocketHandler.notifications.add(eventName)
    }

    fun removeNotification(eventName: String) {
        SocketHandler.notifications.remove(eventName)
    }

    private var onUpdateChat = Emitter.Listener {
        val jsonString = it[0].toString()
        val gson = Gson()
        val socketChatData = gson.fromJson(jsonString, SocketChatData::class.java)
        if (socketChatData.msg.nickname == readSharedPref("nickname")) {
            val music: MediaPlayer = MediaPlayer.create(this, R.raw.msg)
            music.start()
        } else {
            if (currentRoom != socketChatData.roomName && socketChatData.roomName !in joinedDrawings) {
                addNotification(socketChatData.roomName)
            }
            updateBadge()
            val music: MediaPlayer = MediaPlayer.create(this, R.raw.cell_notif)
            music.start()
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        val mainActivityIntent = Intent(this, MainActivity::class.java)
        val profileIntent = Intent(this, ProfileActivity::class.java)

        runBlocking {
            launch {
                when (item.itemId) {
                    R.id.logout -> {
                        val logoutResponse =
                            httpService.logout(LogoutRequest(readSharedPref("useremail")!!))
                        if (logoutResponse != null) {
                            val music: MediaPlayer =
                                MediaPlayer.create(this@BaseActivity, R.raw.notif)
                            music.start()
                            SocketHandler.getSingletonSocket()!!.emit("DISCONNECT")
                            SocketHandler.closeConnection()
                            startActivity(mainActivityIntent)
                            overridePendingTransition(
                                android.R.anim.slide_in_left,
                                android.R.anim.slide_in_left
                            )
                        }
                    }
//                    R.id.profile -> {
//                        startActivity(profileIntent)
//                    }
                }
            }
        }
        return super.onOptionsItemSelected(item)
    }

    private fun updateBadge() {
        runOnUiThread {
            if (SocketHandler.notifications.size == 0) {
                Log.i("TEST_YOUCEF_0", SocketHandler.notifications.size.toString())
                if (chatNotificationsTV!!.visibility != View.GONE) chatNotificationsTV!!.visibility =
                    View.GONE
            } else {
                Log.i("TEST_YOUCEF_!0", this.localClassName)
                Log.i("TEST_YOUCEF_!0", SocketHandler.notifications.size.toString())
                if (chatNotificationsTV!!.visibility != View.VISIBLE) chatNotificationsTV!!.visibility =
                    View.VISIBLE
            }
        }

    }
}