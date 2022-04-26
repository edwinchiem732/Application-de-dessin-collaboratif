package com.example.colorimage.chat

import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import androidx.annotation.RequiresApi
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.*
import com.example.colorimage.http.JoinRoomRequest
import com.example.colorimage.http.Message
import com.example.colorimage.http.MessageResponse
import com.example.colorimage.http.UserObj
import com.example.colorimage.utils.ViewType
import com.google.gson.Gson
import io.socket.client.Socket
import io.socket.emitter.Emitter
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.text.SimpleDateFormat
import java.util.*

class ChatRoomActivity : BaseActivity(), View.OnClickListener {

    lateinit var mSocket: Socket
    var useremail: String? = null
    var nickname: String? = null
    private var roomName: String? = null
    private var roomNameBuffer: String? = null
    var avatar: String? = null
    private lateinit var messageEditText: EditText
    private lateinit var sendButton: ImageView
    var messageList: List<Message>? = null
    private lateinit var chatRecyclerView: RecyclerView
    lateinit var chatRoomAdapter: ChatRoomAdapter
    private var chatList: ArrayList<ChatMessage> = ArrayList()
    private val gson: Gson = Gson()

    override fun onStop() {
        super.onStop()
        currentRoom = ""
    }

    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initUserInfo()
        setup()
        sendJoinRoomPostRequest(JoinRoomRequest(roomName!!, UserObj(useremail!!, nickname!!)))
        currentRoom = roomName!!
        initMessageInputTextWatcher()
        initSocket()
        sendRoomMessagesGetRequest()
        setChatRoomAdapter()
    }

    private fun initUserInfo() {
        roomName = intent.getStringExtra("roomName")
        roomNameBuffer = roomName
        useremail = readSharedPref("useremail")
        nickname = readSharedPref("nickname")
        avatar = readSharedPref("avatar")
    }

    private fun setup() {
        setContentView(R.layout.activity_chat_room)
        supportActionBar!!.title = roomName
        supportActionBar!!.setDisplayHomeAsUpEnabled(false)
        chatRecyclerView = findViewById(R.id.chat_recycler_view)
        messageEditText = findViewById(R.id.message_edit_text)
        sendButton = findViewById(R.id.send_button)
        sendButton.visibility = View.GONE
        sendButton.setOnClickListener(this)
    }

    private fun sendJoinRoomPostRequest(joinRoomRequest: JoinRoomRequest) {
        runBlocking {
            launch {
                val joinRoomResponse: MessageResponse? = httpService.joinRoom(joinRoomRequest)
            }
        }
        removeNotification(roomName!!)
    }

    private fun initMessageInputTextWatcher() {
        val textWatcher = object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {}
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                sendButton.visibility =
                    if (messageEditText.text.isBlank()) View.GONE else View.VISIBLE
            }
        }
        messageEditText.addTextChangedListener(textWatcher)
    }

    private fun initSocket() {
        mSocket = SocketHandler.getSingletonSocket()!!
        mSocket.on("connected", onNewUser)
        mSocket.on("MSG", onUpdateChat)
    }

    private fun sendRoomMessagesGetRequest() {
        runBlocking {
            launch {
                messageList = httpService.getRoomMessages(roomName!!)
                if (messageList!!.isNotEmpty()) {
                    for (message in messageList!!) {
                        var viewType = if (message.nickname == nickname) ViewType.RIGHT else ViewType.LEFT
                        var timeLong = 0L
                        try {
                            timeLong = message.time.toLong()
                        } catch (nfe: NumberFormatException) {
                            nfe.printStackTrace()
                        }
                        val simpleDateFormat =
                            SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.CANADA)
                        val dateString = simpleDateFormat.format(timeLong)
                        chatList.add(
                            ChatMessage(
                                "${message.nickname} $dateString",
                                message.message,
                                roomName!!,
                                viewType
                            )
                        )
                    }
                }
            }
        }
    }

    private fun setChatRoomAdapter() {
        chatRoomAdapter = ChatRoomAdapter(this, chatList)
        chatRecyclerView.adapter = chatRoomAdapter
        val layoutManager = LinearLayoutManager(this)
        chatRecyclerView.layoutManager = layoutManager
        chatRecyclerView.scrollToPosition(chatList.size - 1) //move focus on last message
    }



    private fun addItemToRecyclerView(message: ChatMessage) {
        // Since this function is inside of the listener,
        // We need to do it on UIThread!
        runOnUiThread {
            chatList.add(message)
            chatRoomAdapter.notifyItemInserted(chatList.size)
            chatRecyclerView.scrollToPosition(chatList.size - 1) //move focus on last message
        }
    }



    private var onUpdateChat = Emitter.Listener {
        val jsonString = it[0].toString()
        val socketChatData = gson.fromJson(jsonString, SocketChatData::class.java)
        if (socketChatData.roomName == roomName) {
            val simpleDateFormat = SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.CANADA)
            val dateString = simpleDateFormat.format(socketChatData.msg.time)
            val message = ChatMessage(
                "${socketChatData.msg.nickname} $dateString",
                socketChatData.msg.message.trim(),
                socketChatData.roomName!!,
                ViewType.LEFT
            )
            addItemToRecyclerView(message)
        }
    }

    private fun sendMessage() {
        // emit the new message to other users
        val content = messageEditText.text.toString()

        val currentDate = Date()
        val sendData = NetworkMessage(currentDate.time, nickname!!, content.trim(), avatar!!)
        val jsonData = gson.toJson(sendData)
        mSocket.emit("MSG", jsonData)

        // add message to user view
        val simpleDateFormat = SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.CANADA)
        val dateString = simpleDateFormat.format(currentDate)
        val message =
            ChatMessage("$nickname  $dateString", content.trim(), roomName!!, ViewType.RIGHT)
        addItemToRecyclerView(message)
        messageEditText.setText("")

    }

    private var onNewUser = Emitter.Listener {
        Log.i("NEW_USER", "${(it[0] as String).trim()} AS JOINED")
    }

    override fun onClick(p0: View?) {
        when (p0!!.id) {
            R.id.send_button -> sendMessage()
        }
    }

}