package com.example.colorimage.albums

import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.media.MediaPlayer
import com.google.gson.Gson
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.AlbumModified
import com.example.colorimage.BaseActivity
import com.example.colorimage.R
import com.example.colorimage.SocketHandler
import com.example.colorimage.albums.AlbumAdapter.*
import com.example.colorimage.carousel.CarouselActivity
import com.example.colorimage.http.*
import com.example.colorimage.localization.LanguageManager
import com.example.colorimage.profile.ProfileActivity
import com.example.colorimage.rooms_list.RoomsListActivity
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.util.*
import com.example.colorimage.MainActivity





class AlbumsActivity : BaseActivity(), OnLeaveAlbumListener, OnPrefListener, OnDeleteListener, OnOpenAlbumListener {
    private var recyclerView: RecyclerView? = null
    lateinit var adapter: AlbumAdapter

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_albums)
        runOnUiThread {
            findViewById<Button>(R.id.chat_button).text = languageManager.localizedContext!!.getString(R.string.chat)
            findViewById<Button>(R.id.create_album_button).text = languageManager.localizedContext!!.getString(R.string.create_album)
            findViewById<Button>(R.id.account_menu_button).text = languageManager.localizedContext!!.getString(R.string.profile_page_title)
        }
        setTitle("Albums")
        val sortAlphaButton = findViewById<ImageButton>(R.id.sort_alpha)
        val sortDateButton = findViewById<ImageButton>(R.id.sort_date)
        var alphaAscending = true
        var dateAscending = true
        sortAlphaButton.setOnClickListener {
            if(alphaAscending) {
                adapter.albumsList.sortBy { it.albumName }
                alphaAscending = !alphaAscending
            }
            else {
                adapter.albumsList.sortByDescending { it.albumName }
                alphaAscending = !alphaAscending
            }
            val publicAlbum = adapter.albumsList.find { it.albumName == "PUBLIC"}
            adapter.albumsList.removeAll { it.albumName == "PUBLIC" }
            adapter.albumsList.add(0, publicAlbum!!)
            runOnUiThread {
                adapter.notifyDataSetChanged()
            }
        }

        sortDateButton.setOnClickListener {
            if(dateAscending) {
                adapter.albumsList.sortBy { it.dateCreation }
                dateAscending = !dateAscending
            }
            else {
                adapter.albumsList.sortByDescending { it.dateCreation }
                dateAscending = !dateAscending
            }
            val publicAlbum = adapter.albumsList.find { it.albumName == "PUBLIC"}
            adapter.albumsList.removeAll { it.albumName == "PUBLIC" }
            adapter.albumsList.add(0, publicAlbum!!)
            runOnUiThread {
                adapter.notifyDataSetChanged()
            }
        }




        recyclerView = findViewById(R.id.albumsRV)
        runBlocking {
            launch {
                updateAlbumsList(false)
                adapter = AlbumAdapter(
                    albumsListBase,
                    this@AlbumsActivity,
                    this@AlbumsActivity,
                    this@AlbumsActivity,
                    this@AlbumsActivity,
                    this@AlbumsActivity
                )
                val layoutManager = GridLayoutManager(this@AlbumsActivity, 2)
                recyclerView!!.layoutManager = layoutManager
                recyclerView!!.adapter = adapter
                setChatButton()
                setCreateAlbumPrompt()
            }
        }

        setAccountMenuClickListener()
    }

    private fun setChatButton() {
        val chatButton: Button = findViewById(R.id.chat_button)
        chatButton.setOnClickListener {
            val music: MediaPlayer = MediaPlayer.create(this, R.raw.ui2)
            music.start()
            startActivity(Intent(this, RoomsListActivity::class.java))
            overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
        }
    }

    private fun setAccountMenuClickListener() {
        val accountMenuButton: Button = findViewById(R.id.account_menu_button)
        accountMenuButton.setOnClickListener {
//            val music: MediaPlayer = MediaPlayer.create(this, R.raw.ui2)
//            music.start()
            startActivity(Intent(this, ProfileActivity::class.java))
            overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
        }
    }


    override fun onResume() {
        super.onResume()
        runBlocking {
            launch {
                updateAlbumsList()
            }
        }
    }



        private fun setCreateAlbumPrompt() {
            val createAlbumButton = findViewById<Button>(R.id.create_album_button)

            createAlbumButton.setOnClickListener {
                val builder = AlertDialog.Builder(this)
                val inflater = layoutInflater
                val dialogLayout = inflater.inflate(R.layout.create_album_prompt, null)
                val albumNameEditText = dialogLayout.findViewById<EditText>(R.id.album_name_text_edit)
                val albumDescriptionEditText = dialogLayout.findViewById<EditText>(R.id.album_description_text_edit)
                runOnUiThread {
                    albumNameEditText.hint =
                        languageManager.localizedContext!!.getString(R.string.enter_new_album_name)
                    albumDescriptionEditText.hint =
                        languageManager.localizedContext!!.getString(R.string.enter_description)
                }
                with(builder) {
                    runOnUiThread {
                        setTitle(languageManager.localizedContext!!.getString(R.string.create_album))

                        setPositiveButton(languageManager.localizedContext!!.getString(R.string.create)) { dialog, _ ->
                            if (albumDescriptionEditText.text.toString()
                                    .isEmpty() && albumNameEditText.text.toString().isEmpty()
                            ) {
                                onErrorClick(getStr(R.string.no_empty_field), R.raw.error)
                            } else {
                                val createAlbumRequest = CreateAlbumRequest(
                                    albumNameEditText.text.toString(),
                                    readSharedPref("useremail")!!,
                                    "private",
                                    albumDescriptionEditText.text.toString()
                                )
                                val joinAlbumRequest = JoinAlbumRequest(
                                    albumNameEditText.text.toString(),
                                    readSharedPref("useremail")!!
                                )
                                runBlocking {
                                    val x = httpService.createAlbum(createAlbumRequest)
                                    val y = httpService.joinAlbum(joinAlbumRequest)
                                    updateAlbumsList()
                                }
                            }
                        }
                        setNegativeButton(languageManager.localizedContext!!.getString(R.string.cancel)) { _, _ -> }
                    }
                    setView(dialogLayout)
                    show()
                }
            }
        }


    fun getStr(ref: Int): String = languageManager.localizedContext!!.getString(ref)

        private fun isMember(album: Album) = readSharedPref("useremail") in album.members!!


    override fun onBackPressed() {}


    fun onErrorClick(message: String, audio: Int) {
        val toast: Toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        toast.show()
        val music: MediaPlayer = MediaPlayer.create(this, audio)
        music.start()
    }


        override fun onPrefClick(position: Int) {
            val builder = AlertDialog.Builder(this)
            val inflater = layoutInflater
            val dialogLayout = inflater.inflate(R.layout.create_album_prompt, null)
            val albumNameEditText = dialogLayout.findViewById<EditText>(R.id.album_name_text_edit)
            val albumDescriptionEditText = dialogLayout.findViewById<EditText>(R.id.album_description_text_edit)
            runOnUiThread {
                albumNameEditText.hint =
                    languageManager.localizedContext!!.getString(R.string.enter_new_album_name)
                albumDescriptionEditText.hint =
                    languageManager.localizedContext!!.getString(R.string.enter_description)
            }
            with(builder) {
                runOnUiThread {
                    setTitle(languageManager.localizedContext!!.getString(R.string.modify_album))
                    setPositiveButton(languageManager.localizedContext!!.getString(R.string.modify)) { _, _ ->
                        val albumData = AlbumData(
                            adapter.albumsList!![position].albumName,
                            albumDescriptionEditText.text.toString()
                        )
                        runBlocking {
                            launch {
                                if ( albumDescriptionEditText.text.toString().isEmpty() && albumNameEditText.text.toString()
                                        .isEmpty()
                                ) {
                                    onErrorClick(getStr(R.string.no_empty_field), R.raw.error)
                                }
                                else if (albumNameEditText.text.toString() == adapter.albumsList!![position].albumName || albumNameEditText.text.toString()
                                        .isEmpty()
                                ) {
                                    val updateAlbumRequest =
                                        UpdateAlbumRequest(readSharedPref("useremail")!!, albumData)
                                    Log.i("update_album", updateAlbumRequest.toString())
                                    val x = httpService.updateAlbum(updateAlbumRequest)
                                    Log.i("update_album", x!!.message)
                                } else {
                                    val updateAlbumRequest = UpdateAlbumRequestNewName(
                                        albumNameEditText.text.toString(),
                                        readSharedPref("useremail")!!,
                                        albumData
                                    )
                                    Log.i("update_album", updateAlbumRequest.toString())
                                    val x = httpService.updateAlbum(updateAlbumRequest)
                                    Log.i("update_album", x!!.message)
                                }
                                updateAlbumsList()
                            }
                        }
                    }
                    setNegativeButton(languageManager.localizedContext!!.getString(R.string.cancel)) { _, _ -> }
                    setView(dialogLayout)
                    show()
                }
            }
        }

        override fun onDeleteClick(position: Int) {
            runBlocking {
                launch {
                    val deleteAlbumRequest = DeleteAlbumRequest(readSharedPref("useremail")!!, adapter.albumsList!![position].albumName)
                    Log.i("delete_album", deleteAlbumRequest.toString())
                    val x = httpService.deleteAlbum(deleteAlbumRequest)
                    Log.i("delete_album", x!!.message)
                }
            }
        }

        private fun isOwner(album: Album) = readSharedPref("useremail") == album.creator

        override fun onLeaveAlbumClick(position: Int) {
            runBlocking {
                launch {
                    val leaveAbumRequest = LeaveAlbumRequest(adapter.albumsList[position].albumName, readSharedPref("useremail")!!)
                    Log.i("leave_album", leaveAbumRequest.toString())
                    val x = httpService.leaveAlbum(leaveAbumRequest)
                    Log.i("leave_album", x!!.message)
                    updateAlbumsList()
                }
            }
        }

        suspend fun sendJoinAlbumRequest(position: Int) {
            val addRequestAlbum = AddRequestAlbum(readSharedPref("useremail")!!, adapter.albumsList[position].albumName)
            Log.i("ADD REQUEST ALBUM", addRequestAlbum.toString())
            val x = httpService.addRequestAlbum(addRequestAlbum)
            Log.i("ADD REQUEST ALBUM", x!!.message)
        }

        override fun onOpenAlbumClick(position: Int) {
            if (isMember(adapter.albumsList[position])) {
                val music: MediaPlayer = MediaPlayer.create(this, R.raw.ui2)
                music.start()
                val intent = Intent(this, CarouselActivity::class.java)
                intent.putExtra("albumName", adapter.albumsList!![position].albumName)
                startActivity(intent)
                overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
            }
        }
    }
