package com.example.colorimage.http

object HttpRoutes {
    private const val BASE_URL = "https://projet3-3990-207.herokuapp.com"

    // AUTH
    const val LOGIN = "$BASE_URL/user/loginUser"
    const val LOGOUT = "$BASE_URL/user/logoutUser"
    const val REGISTER = "$BASE_URL/user/registerUser"

    // MESSAGES
    const val MESSAGES = "$BASE_URL/message/getRoomMessages"

    const val ROOMS = "$BASE_URL/room/getAllRooms"

    const val JOIN_ROOM = "$BASE_URL/room/joinRoom"

    const val JOIN_DRAWING = "$BASE_URL/drawing/joinDrawing"

    const val GET_ALL_DRAWINGS = "$BASE_URL/drawing/getAllDrawings"

    const val DELETE_ROOM = "$BASE_URL/room/deleteRoom"

    const val CREATE_ROOM = "$BASE_URL/room/createRoom"

    const val LEAVE_ROOM = "$BASE_URL/room/leaveRoom"

    const val GET_ALL_ALBUMS = "$BASE_URL/album/getAlbums"

    const val CREATE_ALBUM = "$BASE_URL/album/createAlbum"

    const val GET_DRAWINGS_IN_ALBUM = "$BASE_URL/album/getDrawings"

    const val ADD_DRAWING = "$BASE_URL/album/addDrawing"

    const val JOIN_ALBUM = "$BASE_URL/album/joinAlbum"

    const val LEAVE_ALBUM = "$BASE_URL/album/leaveAlbum"

    const val DELETE_ALBUM = "$BASE_URL/album/deleteAlbum"
    const val CREATE_DRAWING = "$BASE_URL/drawing/createDrawing"

    const val LEAVE_DRAWING = "$BASE_URL/drawing/leaveDrawing"

    const val DELETE_DRAWING = "$BASE_URL/drawing/deleteDrawing"

    const val UPDATE_ALBUM = "$BASE_URL/album/updateAlbum"

    const val UPDATE_DRAWING = "$BASE_URL/drawing/updateDrawing"

    const val ACCEPT_REQUEST_ALBUM = "$BASE_URL/album/acceptRequest"

    const val ADD_REQUEST_ALBUM = "$BASE_URL/album/addRequest"

    const val CHANGE_PASSWORD = "$BASE_URL/drawing/changePassword "

    const val ADD_FRIEND = "$BASE_URL/user/addFriend"

    const val REMOVE_FRIEND = "$BASE_URL/user/removeFriend"


}

