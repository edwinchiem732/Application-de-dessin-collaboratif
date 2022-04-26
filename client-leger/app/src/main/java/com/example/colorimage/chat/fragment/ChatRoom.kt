package com.example.colorimage.chat.fragment

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.*
import com.example.colorimage.chat.ChatRoomAdapter
import com.example.colorimage.http.*
import com.example.colorimage.utils.ViewType
import com.google.gson.Gson
import io.socket.client.Socket
import io.socket.emitter.Emitter
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.text.SimpleDateFormat
import java.util.*

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [ChatRoom.newInstance] factory method to
 * create an instance of this fragment.
 */
class ChatRoom : Fragment(), View.OnClickListener {
    lateinit var mSocket: Socket
    private val httpService = HttpService.create()
    var useremail: String? = null
    var nickname: String? = null
    var avatar: String? = null
    private var roomName: String? = null
    private var roomNameBuffer: String? = null
    private lateinit var messageEditText: EditText
    private lateinit var sendButton: ImageView
    var messageList: List<Message>? = null
    private lateinit var chatRecyclerView: RecyclerView
    lateinit var chatRoomAdapter: ChatRoomAdapter
    private var chatList: ArrayList<ChatMessage> = ArrayList()
    private val gson: Gson = Gson()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initUserInfo()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_chat_room, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        chatRecyclerView = requireView().findViewById(R.id.chat_recycler_view_frag)
        messageEditText = requireView().findViewById(R.id.message_edit_text_frag)
        sendButton = requireView().findViewById(R.id.send_button_frag)
        sendButton.visibility = View.GONE
        sendButton.setOnClickListener(this)
        initMessageInputTextWatcher()
        initSocket()
        sendRoomMessagesGetRequest()
        setChatRoomAdapter()

    }



    private fun readSharedPref(key: String): String? {
        return requireActivity().getSharedPreferences("myAppPrefs", AppCompatActivity.MODE_PRIVATE).getString(key, null)
    }

    private fun initUserInfo() {
        roomName = requireActivity()!!.getIntent().getStringExtra("drawingName")
        useremail = readSharedPref("useremail")
        nickname = readSharedPref("nickname")
        avatar = readSharedPref("avatar")
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
        chatRoomAdapter = ChatRoomAdapter(requireContext(), chatList)
        chatRecyclerView.adapter = chatRoomAdapter
        val layoutManager = LinearLayoutManager(requireContext())
        chatRecyclerView.layoutManager = layoutManager
        chatRecyclerView.scrollToPosition(chatList.size - 1) //move focus on last message
    }


    private fun addItemToRecyclerView(message: ChatMessage) {
        // Since this function is inside of the listener,
        // We need to do it on UIThread!
        requireActivity().runOnUiThread {
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
            R.id.send_button_frag -> sendMessage()
        }
    }



}



//companion object {
//    /**
//     * Use this factory method to create a new instance of
//     * this fragment using the provided parameters.
//     *
//     * @param param1 Parameter 1.
//     * @param param2 Parameter 2.
//     * @return A new instance of fragment ChatRoom.
//     */
//    // TODO: Rename and change types and number of parameters
//    @JvmStatic
//    fun newInstance(param1: String, param2: String) =
//        ChatRoom().apply {
//            arguments = Bundle().apply {
//                putString(ARG_PARAM1, param1)
//                putString(ARG_PARAM2, param2)
//            }
//        }
//}