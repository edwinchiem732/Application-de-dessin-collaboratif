package com.example.colorimage.svgcanvas.active_drawing_members;

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.Button
import android.widget.TextView
import com.example.colorimage.R
import com.example.colorimage.http.AddFriendRequest
import com.example.colorimage.http.HttpService
import com.example.colorimage.utils.RequestsResponses
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class ActiveUsersListAdapter(
    private val context: Context,
    private val currentDrawingActiveUsersData: ArrayList<String>,
    private val friendList: ArrayList<String>,
    private val useremail: String
) :
    BaseAdapter() {
    private val httpService: HttpService = HttpService.create()


    override fun getCount(): Int {
        // return the number of records
        return currentDrawingActiveUsersData.size
    }

    // getView method is called for each item of ListView
    override fun getView(position: Int, view: View?, parent: ViewGroup): View {
        // inflate the layout for each item of listView
        var view = view
        val inflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        view = inflater.inflate(R.layout.view_listview_row, parent, false)

        // get the reference of textView and button
        val nickname = view.findViewById<View>(R.id.nickname) as TextView
        val sendFriendRequestBtn = view.findViewById<View>(R.id.send_friend_request_btn) as Button

        // Set the title and button name
        nickname.text = currentDrawingActiveUsersData[position]
        sendFriendRequestBtn.setText(R.string.add_as_friend_btn_label)


        // Click listener of button
        sendFriendRequestBtn.setOnClickListener {
            // Logic goes here
            runBlocking {
                launch {
                    val addFriendResponse = httpService.addFriend(
                        AddFriendRequest(
                            currentDrawingActiveUsersData[position],
                            useremail
                        )
                    )
                    when (addFriendResponse!!.message) {
                        RequestsResponses.SUCCESS -> {
                            Log.i("ADD_FRIEND", "ADD FRIEND SUCCESS")
                        }
                    }
                }
            }
            if (currentDrawingActiveUsersData[position] in friendList) {
                sendFriendRequestBtn.visibility = View.INVISIBLE
            }
        }

        if (currentDrawingActiveUsersData[position] in friendList) {
            sendFriendRequestBtn.visibility = View.INVISIBLE
        }
        return view
    }

    override fun getItem(position: Int): Any {
        return currentDrawingActiveUsersData[position]
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    fun adduserToCurrentDrawingActiveUser(useremail: String) {
        if (useremail !in currentDrawingActiveUsersData) {
            currentDrawingActiveUsersData.add(useremail)
        }

    }

}