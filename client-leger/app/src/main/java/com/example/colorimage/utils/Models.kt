package com.example.colorimage

import com.example.colorimage.http.Album
import com.example.colorimage.http.Drawing
import com.example.colorimage.http.Room
import com.example.colorimage.utils.ViewType
import kotlinx.serialization.Serializable

data class ChatMessage(
    val nickname: String,
    val messageContent: String,
    val roomName: String,
    var viewType: ViewType
)

data class initialData(val userName: String, val roomName: String)
//data class SendMessage(val userName: String, val messageContent: String, val roomName: String)

data class SocketChatData(
    val roomName: String,
    val msg: NetworkMessage
)

@Serializable
data class NetworkMessage(
    val time: Long,
    val nickname: String,
    val message: String,
    val avatar: String,
)

data class User(
    val useremail: String
)

@Serializable
data class DrawingVisibiltyChanged(
    val drawing: Drawing
)

@Serializable
data class DrawingModified (
    val oldName: String,
    val drawing: Drawing
)

@Serializable
data class RoomModified (
    val oldName: String,
    val room: Room
)

@Serializable
data class AlbumModified (
    val album: Album,
)


