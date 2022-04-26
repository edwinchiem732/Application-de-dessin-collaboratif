package com.example.colorimage.profile

import android.os.Build
import android.os.Bundle
import android.text.Html
import android.text.Spanned
import android.util.Log
import android.view.View
import android.widget.ListView
import android.widget.TextView
import androidx.annotation.RequiresApi
import com.example.colorimage.BaseActivity
import com.example.colorimage.R
import com.example.colorimage.SocketHandler
import com.example.colorimage.databinding.ActivityProfileBinding
import com.google.gson.Gson
import com.mocircle.android.logging.CircleLog
import com.mocircle.cidrawing.utils.SocketEventFriendModifiedResponse
import io.socket.client.Socket
import java.text.SimpleDateFormat
import java.util.*

class ProfileActivity : BaseActivity() {

    private lateinit var binding: ActivityProfileBinding
    private lateinit var useremail: String
    private lateinit var friendListAdapter: FriendListAdapter
    private lateinit var friendsList: ArrayList<String>
    private lateinit var socket: Socket
    var gson: Gson = Gson()
    var imageIdList = arrayListOf<Int>(
        R.drawable.avatar1,
        R.drawable.avatar2,
        R.drawable.avatar3,
        R.drawable.avatar4,
        R.drawable.avatar5
    )


    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)
        socket = SocketHandler.mSocket!!
        setDeleteFriendSocketEventListener()
        title = getStr(R.string.profile_page_title)
        val nickname = readSharedPref("nickname")
        val lastLoggedIn = readSharedPref("lastLoggedIn")
        val lastLoggedOut = readSharedPref("lastLoggedOut")
        val avatarIndex = readSharedPref("avatar")
        useremail = readSharedPref("useremail")!!
        friendsList = readSharedPrefArray("friends")


        friendListAdapter = FriendListAdapter(this, friendsList!!, useremail)

        val friendListView: ListView = findViewById<ListView>(R.id.friend_list_view)
        val header = layoutInflater.inflate(R.layout.friends_list_header_view, null)

        friendListView.addHeaderView(header)
        friendListView.adapter = friendListAdapter

        Log.i("FRIENDS_LIST", friendsList.toString())

        binding.userProfileEmail.text = setTextHTML(getStr(R.string.profile_email, useremail))
        binding.userProfileNickname.text =
            setTextHTML(getStr(R.string.profile_nickname, nickname!!))
        binding.userProfileLastLoginDate.text =
            setTextHTML(getStr(R.string.profile_last_logged_in, formatDate(lastLoggedIn!!)!!))
        binding.userProfileLastLogoutDate.text =
            setTextHTML(getStr(R.string.profile_last_logged_out, formatDate(lastLoggedOut!!)!!))
        binding.empty.text = setTextHTML(getStr(R.string.empty_friend_list_placeholder))
        val headerTV = header.findViewById<TextView>(R.id.friends_list_view_header)
        headerTV.text = getStr(R.string.friend_list_header_text)
        if (avatarIndex != "") {
            binding.userProfileAvatar.setImageResource(imageIdList[avatarIndex!!.toInt()])
        }
    }

    fun getStr(ref: Int, arg: String): String = languageManager.localizedContext!!.getString(ref, arg)
    fun getStr(ref: Int): String = languageManager.localizedContext!!.getString(ref)
    override fun onContentChanged() {
        super.onContentChanged()
        val empty: View = findViewById(R.id.empty)
        val list = findViewById<View>(R.id.friend_list_view) as ListView
        list.emptyView = empty
    }


    private fun formatDate(date: String): String? {
        if (date == "") {
            return "--"
        }
        val simpleDateFormat = SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.CANADA)
        return simpleDateFormat.format(date.toLong())
    }


    private fun setTextHTML(html: String): Spanned {
        val result: Spanned =
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                Html.fromHtml(html, Html.FROM_HTML_MODE_LEGACY)
            } else {
                Html.fromHtml(html)
            }
        return result
    }


    private fun setDeleteFriendSocketEventListener() {
        socket.on("friends modified") {
            val jsonString = it[0].toString()
            val removeFriendResponse =
                gson.fromJson(jsonString, SocketEventFriendModifiedResponse::class.java)

            if (removeFriendResponse.user1.useremail.equals(useremail) || removeFriendResponse.user2.equals(
                    useremail
                )
            ) {
                CircleLog.i("ON_DELETE_FRIEND", removeFriendResponse.toString())
                friendListAdapter.removeFriend(removeFriendResponse.user2.useremail)

                runOnUiThread {
                    friendListAdapter.notifyDataSetChanged()
                }

                // update friends list
                val friendsList = getArrayPrefs("friends")
                if (removeFriendResponse.user2.useremail in friendsList) {
                    friendsList.remove(removeFriendResponse.user2.useremail)
                    setArrayPrefs("friends", friendsList)
                }

            }
        }
    }
}