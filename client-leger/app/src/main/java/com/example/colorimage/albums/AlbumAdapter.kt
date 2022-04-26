package com.example.colorimage.albums

import android.content.Context
import android.media.MediaPlayer
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.R
import com.example.colorimage.http.Album
import com.example.colorimage.rooms_list.RoomsListActivity
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.util.ArrayList

class AlbumAdapter(recyclerAlbumsList: MutableList<Album>, var context: Context, onLeaveAlbumListener: OnLeaveAlbumListener, onOpenAlbumListener: OnOpenAlbumListener, onDeleteListener: OnDeleteListener, onPrefListener: OnPrefListener ) :
    RecyclerView.Adapter<AlbumAdapter.RecyclerViewHolder>() {
    var albumsList: MutableList<Album> = recyclerAlbumsList
    private val mOnOpenAlbumListener: OnOpenAlbumListener = onOpenAlbumListener
    private val mOnDeleteListener: OnDeleteListener = onDeleteListener
    private val mOnPrefListener: OnPrefListener = onPrefListener
    private val mOnLeaveAlbumListener: OnLeaveAlbumListener = onLeaveAlbumListener
    private val mcontext = context

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerViewHolder {
        val view: View =
            LayoutInflater.from(parent.context).inflate(R.layout.album_card, parent, false)
        return RecyclerViewHolder(view, mOnLeaveAlbumListener, mOnOpenAlbumListener, mOnDeleteListener, mOnPrefListener)
    }

    private fun isOwner(position: Int) = readSharedPref("useremail") == albumsList!!.get(position).creator
    private fun isMember(position: Int) = readSharedPref("useremail") in albumsList!!.get(position).members!!

    private fun readSharedPref(key: String): String? = mcontext.getSharedPreferences("myAppPrefs", AppCompatActivity.MODE_PRIVATE).getString(key, null)

    override fun onBindViewHolder(holder: RecyclerViewHolder, position: Int) {
        val album: Album = albumsList[position]
        holder.albumTitle.text = album.albumName
    }

    override fun getItemCount(): Int {
        return albumsList.size
    }

    // View Holder Class to handle Recycler View.
    inner class RecyclerViewHolder(itemView: View,  onLeaveAlbumListener: OnLeaveAlbumListener,  onOpenAlbumListener: OnOpenAlbumListener, onDeleteListener: OnDeleteListener, onPrefListener: OnPrefListener) : RecyclerView.ViewHolder(itemView){
        private val openAlbumButton: Button = itemView.findViewById(R.id.open_album_button)
        val albumTitle: TextView = itemView.findViewById(R.id.idTextViewAlbumTitle)
        private val prefButton: Button = itemView.findViewById(R.id.album_preferences_button)
        private val deleteButton: Button = itemView.findViewById(R.id.delete_album_button)
        private val leaveAlbumButton: Button = itemView.findViewById(R.id.leave_album_button)

        init {
            (context as AlbumsActivity).runOnUiThread {
                openAlbumButton.text = (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.open)
                prefButton.text = (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.preferences)
                deleteButton.text = (context as AlbumsActivity).languageManager .localizedContext!!.getString((R.string.delete))
                leaveAlbumButton.text = (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.leave)
            }
            openAlbumButton.setOnClickListener {
                if(!isMember(adapterPosition)) {
                 onErrorClick(openAlbumButton,  (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.request_sent), R.raw.email)
                    runBlocking {
                        launch {
                            (context as AlbumsActivity).sendJoinAlbumRequest(adapterPosition)
                        }
                    }

                } else {
                    onOpenAlbumListener.onOpenAlbumClick(adapterPosition)
                }
            }
            prefButton.setOnClickListener {
                if (!isOwner(adapterPosition)) {
                    onErrorClick(prefButton,  (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.not_the_owner), R.raw.error)
                } else {
                    onPrefListener.onPrefClick(adapterPosition)
                }
            }
            deleteButton.setOnClickListener {
                if (albumsList?.get(adapterPosition)?.albumName == "PUBLIC"){
                    onErrorClick(deleteButton, (context as RoomsListActivity).languageManager .localizedContext!!.getString(R.string.public_album), R.raw.error)
                } else if (!isOwner(adapterPosition)) {
                    onErrorClick(deleteButton, (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.not_the_owner), R.raw.error)
                } else {
                    val music: MediaPlayer = MediaPlayer.create(context, R.raw.bin)
                    music.start()
                    onDeleteListener.onDeleteClick(adapterPosition)
                }
            }
            leaveAlbumButton.setOnClickListener {

                if (albumsList?.get(adapterPosition)?.albumName == "PUBLIC"){
                    onErrorClick(deleteButton, (context as RoomsListActivity).languageManager .localizedContext!!.getString(R.string.public_album), R.raw.error)
                }
                else if (isOwner(adapterPosition)) {
                    onErrorClick(leaveAlbumButton, (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.is_the_owner), R.raw.error)
                } else if (!isMember(adapterPosition)){
                    onErrorClick(leaveAlbumButton, (context as AlbumsActivity).languageManager .localizedContext!!.getString(R.string.not_a_member), R.raw.error)
                } else {
                    onLeaveAlbumListener.onLeaveAlbumClick(adapterPosition)
                }
            }
        }

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

    interface OnPrefListener {
        fun onPrefClick(position: Int)
    }

    interface OnDeleteListener {
        fun onDeleteClick(position: Int)
    }

    interface OnOpenAlbumListener {
        fun onOpenAlbumClick(position: Int)
    }

    interface OnLeaveAlbumListener {
        fun onLeaveAlbumClick(position: Int)
    }
}