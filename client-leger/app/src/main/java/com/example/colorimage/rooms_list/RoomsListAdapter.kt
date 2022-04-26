package com.example.colorimage.rooms_list

import android.content.Context
import android.media.MediaPlayer
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.R
import com.example.colorimage.albums.AlbumsActivity
import com.example.colorimage.http.Room


class RoomsListAdapter(
    recyclerList: MutableList<Room>?,
    var context: Context,
    onJoinRoomListener: OnJoinRoomListener, onDeleteRoomListener: OnDeleteRoomListener, onQuitRoomListener: OnQuitRoomListener
) :
    RecyclerView.Adapter<RoomsListAdapter.RecyclerViewHolder>() {
    var roomsList: MutableList<Room>? = recyclerList
    var mcontext: Context = context
    private val mOnJoinRoomListener: OnJoinRoomListener = onJoinRoomListener
    private val mOnDeleteRoomListener: OnDeleteRoomListener = onDeleteRoomListener
    private val mOnQuitRoomListener: OnQuitRoomListener = onQuitRoomListener

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerViewHolder {
        val view: View = LayoutInflater.from(parent.context).inflate(R.layout.room_card, parent, false)
        return RecyclerViewHolder(view, mOnJoinRoomListener, mOnDeleteRoomListener, mOnQuitRoomListener)
    }

    override fun onBindViewHolder(holder: RecyclerViewHolder, position: Int) {
        // Set the data to textview and imageview.
        val room: Room = roomsList!![position]
        holder.roomTV.text = room.roomName
    }

    private fun isCreator(position: Int) = readSharedPref("useremail") == roomsList!![position].creator

    private fun isMember(position: Int) = readSharedPref("useremail") in roomsList!![position].members!!

    private fun isDefault(position: Int) = roomsList!!.get(position).roomName == "DEFAULT"

    private fun readSharedPref(key: String): String? = mcontext.getSharedPreferences("myAppPrefs", AppCompatActivity.MODE_PRIVATE).getString(key, null)

    override fun getItemCount(): Int {
        return roomsList!!.size
    }
    fun onErrorClick(button: Button, message: String, audio: Int) {
        val toast: Toast = Toast.makeText(context, message, Toast.LENGTH_SHORT)
        val animation: Animation =  AnimationUtils.loadAnimation(
            context,
            R.anim.wobble
        )
        animation.repeatCount = 3
        button.startAnimation(animation)
        toast.show()
        val music: MediaPlayer = MediaPlayer.create(context, audio)
        music.start()
    }

    inner class RecyclerViewHolder(itemView: View, onJoinRoomListener: OnJoinRoomListener, onDeleteRoomListener: OnDeleteRoomListener, onQuitRoomListener: OnQuitRoomListener) : RecyclerView.ViewHolder(itemView), View.OnClickListener {
        val roomTV: TextView = itemView.findViewById(R.id.room_name_textview)
        val deleteButton: Button = itemView.findViewById((R.id.delete_room_button))
        val quitButton: Button = itemView.findViewById((R.id.quit_room_button))
        val joinButton: Button = itemView.findViewById(R.id.join_room_button)
        private val rOnJoinRoomListener: OnJoinRoomListener = onJoinRoomListener
        private val rOnDeleteRoomListener: OnDeleteRoomListener = onDeleteRoomListener
        private val rOnQuitRoomListener: OnQuitRoomListener = onQuitRoomListener

        init {
            (context as RoomsListActivity).runOnUiThread {
                deleteButton.text =
                    (context as RoomsListActivity).languageManager.localizedContext!!.getString(R.string.delete)
                quitButton.text =
                    (context as RoomsListActivity).languageManager.localizedContext!!.getString(R.string.leave)
                joinButton.text =
                    (context as RoomsListActivity).languageManager.localizedContext!!.getString(R.string.join)
            }

            joinButton.setOnClickListener(this)
            deleteButton.setOnClickListener {
                if (roomsList?.get(adapterPosition)?.roomName == "DEFAULT"){
                    onErrorClick(deleteButton, (context as RoomsListActivity).languageManager .localizedContext!!.getString(R.string.default_room), R.raw.error)
                } else if(!isCreator(adapterPosition)) {
                    onErrorClick(deleteButton, (context as RoomsListActivity).languageManager .localizedContext!!.getString(R.string.not_the_owner_room), R.raw.error)
                } else {
                    val music: MediaPlayer = MediaPlayer.create(context, R.raw.bin)
                    music.start()
                    rOnDeleteRoomListener.onDeleteRoomClick(adapterPosition)
                }
            }
            quitButton.setOnClickListener {
                if (roomsList?.get(adapterPosition)?.roomName == "DEFAULT"){
                    onErrorClick(quitButton, (context as RoomsListActivity).languageManager .localizedContext!!.getString(R.string.default_room), R.raw.error)
                }
                else if (!isMember(adapterPosition)) {
                    onErrorClick(quitButton, (context as RoomsListActivity).languageManager .localizedContext!!.getString(R.string.not_joined_room), R.raw.error)
                } else {
                    rOnQuitRoomListener.onQuitRoomClick(adapterPosition, joinButton, quitButton)
                }
            }
        }

        override fun onClick(p0: View?) {

                rOnJoinRoomListener.onJoinRoomClick(adapterPosition)

        }
    }



    interface OnJoinRoomListener {
        fun onJoinRoomClick(position: Int)
    }

    interface OnDeleteRoomListener {
        fun onDeleteRoomClick(position: Int)
    }

    interface OnQuitRoomListener {
        fun onQuitRoomClick(position: Int, joinButton: Button, quitButton: Button)
    }

}