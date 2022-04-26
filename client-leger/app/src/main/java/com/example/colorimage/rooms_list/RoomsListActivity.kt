package com.example.colorimage.rooms_list

import android.app.AlertDialog
import android.content.Intent
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.BaseActivity
import com.example.colorimage.R
import com.example.colorimage.RoomModified
import com.example.colorimage.SocketHandler
import com.example.colorimage.chat.ChatRoomActivity
import com.example.colorimage.http.*
import com.example.colorimage.rooms_list.RoomsListAdapter.*
import com.google.gson.Gson
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking


class RoomsListActivity : BaseActivity(), OnJoinRoomListener, OnDeleteRoomListener, OnQuitRoomListener {
    private var recyclerView: RecyclerView? = null
    var roomsList: MutableList<Room>? = mutableListOf()
    lateinit var adapter: RoomsListAdapter

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        supportActionBar?.setDisplayHomeAsUpEnabled(false)
        setContentView(R.layout.activity_rooms_list)
        recyclerView = findViewById(R.id.rooms_list_RV)
        val createRoomButton = findViewById<Button>(R.id.create_room_button)
        val filterButton = findViewById<Button>(R.id.filter_rooms_button)
        runOnUiThread {
            createRoomButton.text = getStr(R.string.create_room)
            filterButton.text = getStr(R.string.filter_rooms)
        }
        title = getStr(R.string.rooms)
        runBlocking {
            launch {
                updateRoomsList(null, false)
                adapter = RoomsListAdapter(roomsList, this@RoomsListActivity, this@RoomsListActivity, this@RoomsListActivity, this@RoomsListActivity)
                val layoutManager = GridLayoutManager(this@RoomsListActivity, 1)
                recyclerView!!.layoutManager = layoutManager
                recyclerView!!.adapter = adapter
                setRoomEvents()
                setNewRoomNamePrompt()
                setFilterRoomsPrompt()
            }
        }
    }


    override fun onResume() {
        super.onResume()
        runBlocking {
            launch {
                updateRoomsList(null,true)
            }
        }
    }

    private fun setNewRoomNamePrompt() {
        val createRoomButton = findViewById<Button>(R.id.create_room_button)


        createRoomButton.setOnClickListener {

            val builder = AlertDialog.Builder(this)
            val inflater = layoutInflater
            val dialogLayout = inflater.inflate(R.layout.room_name_prompt, null)
            val editText = dialogLayout.findViewById<EditText>(R.id.drawing_name_text_edit)
            editText.hint = getStr(R.string.enter_new_room_name)
            with(builder) {
                setTitle(getStr(R.string.create_room))
                setPositiveButton(getStr(R.string.create)) { _, _ ->
                    runBlocking {
                        val response = httpService.createRoom(
                            CreateRoomRequest(
                                editText.text.toString(),
                                readSharedPref("useremail")!!
                            )
                        )
                        if (response!!.message == "success") updateRoomsList(null,true)
                    }
                }
                setNegativeButton(getStr(R.string.cancel)) { _, _ ->}
                setView(dialogLayout)
                show()
            }
        }
    }

    private fun setFilterRoomsPrompt() {
        val filterRoomsButton = findViewById<Button>(R.id.filter_rooms_button)

        filterRoomsButton.setOnClickListener {

            val builder = AlertDialog.Builder(this)
            val dialogLayout = layoutInflater.inflate(R.layout.filter_rooms_prompt, null)
            val editText = dialogLayout.findViewById<EditText>(R.id.filter_rooms_text_edit)
            editText.hint = getStr(R.string.enter_term_filter_rooms)
            with(builder) {
                setTitle(getStr(R.string.filter_room_by_name))
                setPositiveButton(getStr(R.string.filter)) { _, _ ->
                    if(editText.text.toString().isNotEmpty()) {
                        runBlocking { updateRoomsList(editText.text.toString(), true) }
                    } else {
                        onErrorClick(getStr(R.string.no_filter), R.raw.ui2 )
                        runBlocking {updateRoomsList(null, true)}
                    }
                }
                setNegativeButton(getStr(R.string.cancel)) { _, _ ->}
                setView(dialogLayout)
                show()
            }
        }
    }

    fun onErrorClick(message: String, audio: Int) {
        val toast: Toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        toast.show()
        val music: MediaPlayer = MediaPlayer.create(this, audio)
        music.start()
    }


    private suspend fun updateRoomsList(filterTerm: String? = null, isForAdapter: Boolean) {
            var newList = httpService.getRoomsList()
            var drawingsList = httpService.getAllDrawings()
            var drawingsNameList = drawingsList!!.map { it.drawingName }
            newList = newList!!.filter {
                it.roomName !in drawingsNameList
            }.toMutableList()
            if (filterTerm != null) {
                newList = newList.filter { it.roomName!!.contains(filterTerm, ignoreCase = true) || it.roomName == "DEFAULT"}!!.toMutableList()
            }
            newList = newList.sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER, { it.roomName!! })).toMutableList()
            val defaultRoom = newList.find { it.roomName == "DEFAULT"}
            val index = newList.indexOfFirst { it.roomName == "DEFAULT" }
            newList.removeAt(index)
            newList.add(0, defaultRoom!!)
            if (isForAdapter) {
                adapter.roomsList!!.clear()
                adapter.roomsList!!.addAll(newList)
                runOnUiThread {
                    adapter.notifyDataSetChanged()
                }
            } else {
                roomsList!!.clear()
                roomsList!!.addAll(newList)
            }
    }


    private fun isMember(position: Int) = readSharedPref("useremail") in adapter.roomsList!!.get(position).members!!

    private fun isDefault(position: Int) = adapter.roomsList!![position].roomName == "DEFAULT"

    override fun onJoinRoomClick(position: Int) {
        val intent = Intent(this, ChatRoomActivity::class.java)
        intent.putExtra("roomName", roomsList!![position].roomName)
        startActivity(intent)
    }

    override fun onDeleteRoomClick(position: Int) {
        runBlocking {
            removeNotification(roomsList!![position].roomName!!)
            val req = DeleteRoomRequest(roomsList!![position].roomName!!)
            Log.i("DELETE_ROOM_REQUEST", req.roomName)
            val res: MessageResponse? =  httpService.deleteRoom(req)
            Log.i("DELETE_ROOM_RESPONSE", res!!.message)
        }
    }

    private fun setRoomEvents() {
        SocketHandler.mSocket?.on("CREATEROOM") {
            runBlocking {
                launch {
                        updateRoomsList(null,true)
                    }
                }
            }

        SocketHandler.mSocket?.on("ROOMDELETED") {
            runBlocking {
                launch {
                    updateRoomsList(null,true)
                }
            }
        }
        SocketHandler.mSocket?.on("ROOMMODIFIED") { event ->
            val jsonString = event[0].toString()
            val roomModified = Gson().fromJson(jsonString, RoomModified::class.java)
            adapter.roomsList!!.removeAll { roomModified.oldName == it.roomName }
            adapter.roomsList!!.add(roomModified.room)
            runOnUiThread {
                adapter.notifyDataSetChanged()
            }
        }


    }



    fun getStr(ref: Int): String = languageManager.localizedContext!!.getString(ref)

    override fun onQuitRoomClick(position: Int, joinButton: Button, quitButton: Button) {
        removeNotification(roomsList!![position].roomName!!)
        runBlocking {
            launch {
                val x = httpService.leaveRoom(LeaveRoomRequest(readSharedPref("useremail")!!, roomsList!![position].roomName!!))
                updateRoomsList(null,true)
                runOnUiThread {
                    adapter.notifyDataSetChanged()
                }
            }
        }
    }




}
