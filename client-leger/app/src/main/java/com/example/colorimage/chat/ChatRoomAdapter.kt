package com.example.colorimage.chat

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.ChatMessage
import com.example.colorimage.R
import com.example.colorimage.utils.ViewType

class ChatRoomAdapter(val context: Context, private val chatList: ArrayList<ChatMessage>) :
    RecyclerView.Adapter<ChatRoomAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        var view: View? = null
        when (viewType) {
            ViewType.RIGHT.value -> {
                view = LayoutInflater.from(context).inflate(R.layout.row_chat_user, parent, false)
            }
            ViewType.LEFT.value -> {
                view = LayoutInflater.from(context).inflate(R.layout.row_chat_partner, parent, false)
            }
        }
        return ViewHolder(view!!)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val messageData = chatList[position]
        holder.userName.text =  messageData.nickname
        holder.message.text = messageData.messageContent
    }

    override fun getItemCount(): Int {
        return chatList.size
    }


    override fun getItemViewType(position: Int): Int {
        return chatList[position].viewType.value
    }



    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val userName: TextView = itemView.findViewById(R.id.username_chat)
        val message: TextView = itemView.findViewById(R.id.message_chat)
    }


}