package com.example.colorimage.profile;

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.Button
import android.widget.TextView
import com.example.colorimage.R
import com.example.colorimage.http.HttpService
import com.example.colorimage.http.RemoveFriendRequest
import com.example.colorimage.utils.RequestsResponses
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking


class FriendListAdapter(
    private val context: Context,
    private var members: ArrayList<String>,
    private val useremail: String
) :
    BaseAdapter() {
    private val httpService: HttpService = HttpService.create()
//    private var removedFriendIndex: Int = -1


    // getView method is called for each item of ListView
    override fun getView(position: Int, view: View?, parent: ViewGroup): View {
        // inflate the layout for each item of listView
        var view = view
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        view = inflater.inflate(R.layout.view_profie_friend_list_view_row, parent, false)

        // get the reference of textView and button
        val nickname = view.findViewById<View>(R.id.profile_members_list_nickname) as TextView
        val removeFriendBtn = view.findViewById<View>(R.id.remove_friend_request_btn) as Button

        // Set the title and button name
        nickname.text = members[position]
        removeFriendBtn.setText(R.string.remove_as_friend_btn_label)

        // Click listener of button
        removeFriendBtn.setOnClickListener {
            runBlocking {
                launch {
                    val removeFriendResponse =
                        httpService.removeFriend(RemoveFriendRequest(useremail, members[position]))
                    when (removeFriendResponse!!.message) {
                        RequestsResponses.SUCCESS -> {
                            Log.i("REMOVE_FRIEND", "REMOVE FRIEND SUCCESS")
//                            removedFriendIndex  = position;
                        }

                    }
                }
            }
        }
        return view
    }

    override fun getCount(): Int {
        return members.size
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    override fun getItem(i: Int): Any {
        return members[i]
    }

    fun removeFriend(useremail: String) {
        if (useremail in members) {
            members.remove(useremail)
        }

    }
}