package com.example.colorimage.http

import android.util.Log
import com.example.colorimage.utils.RequestsResponses
import com.google.gson.Gson
import io.ktor.client.*
import io.ktor.client.features.*
import io.ktor.client.request.*
import io.ktor.http.*

class HttpServiceImplementation(private val httpClient: HttpClient) : HttpService {
    val gson = Gson()

    override suspend fun login(loginRequest: LoginRequest): LoginResponse? {

        return try {
            httpClient.post<LoginResponse> {
                url(HttpRoutes.LOGIN)
                contentType(ContentType.Application.Json)
                body = loginRequest
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Login Error 3xx", e.response.status.description)
            e.message?.let {
                LoginResponse(
                    it.substring(
                        e.message!!.indexOf("\"") + 1,
                        e.message!!.lastIndexOf("\"")
                    ), null, ""
                )
            }
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Login Error 4xx", e.response.status.description)
            val tempResponse = gson.fromJson(
                e.message.substring(
                    e.message.indexOf("\"") + 1,
                    e.message.lastIndexOf("\"")
                ), LoginResponse::class.java
            )
            val userObj =
                tempResponse.user?.let {
                    UserProfilObj(
                        it.useremail,
                        tempResponse.user.nickname,
                        tempResponse.user.lastLoggedIn,
                        tempResponse.user.lastLoggedOut,
                        tempResponse.user.friends,
                        tempResponse.user.avatar
                    )
                }
            LoginResponse(
                tempResponse.message, userObj, tempResponse.currentRoom
            )
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Login Error 5xx", e.toString())
            LoginResponse(RequestsResponses.USER_NOT_FOUND, null, "")
        } catch (e: Exception) {
            e.message?.let { Log.i("Login Error e", it) }
            e.message?.let {
                LoginResponse(it, null, "")
            }
        }
    }

    override suspend fun logout(logoutRequest: LogoutRequest): MessageResponse? {
        return try {
            httpClient.post<MessageResponse> {
                url(HttpRoutes.LOGOUT)
                contentType(ContentType.Application.Json)
                body = logoutRequest
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Logout Error 3xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Logout Error 4xx", e.response.status.description)
            Log.i("Logout Error 4xx", e.response.status.toString())
            MessageResponse(
                e.message.substring(
                    e.message.indexOf("\"") + 1,
                    e.message.lastIndexOf("\"")
                )
            )
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Logout Error 5xx", e.response.status.description)
            e.message?.let {
                e.message!!.substring(
                    it.indexOf("\""),
                    e.message!!.lastIndexOf("\"")
                )
            }
                ?.let { MessageResponse(it) }
        } catch (e: Exception) {
            e.message?.let { Log.i("Logout Error e", it) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun register(registerRequest: RegisterRequest): RegisterResponse? {
        val gson = Gson()

        return try {
            httpClient.post<RegisterResponse> {
                url(HttpRoutes.REGISTER)
                contentType(ContentType.Application.Json)
                body = registerRequest
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Register Error 3xx", e.response.status.description)
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), RegisterResponse::class.java
            )
            RegisterResponse(tempResponse.message, e.response.status.toString())
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Register Error 4xx", e.response.status.description)
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), RegisterResponse::class.java
            )
            RegisterResponse(tempResponse.message, e.response.status.toString())
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Register Error 5xx", e.toString())
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), RegisterResponse::class.java
            )
            RegisterResponse(tempResponse.message, e.response.status.toString())
        } catch (e: Exception) {
            Log.i("Login Error e", e.stackTraceToString())
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), RegisterResponse::class.java
            )
            RegisterResponse(tempResponse.message, null)
        }
    }

    override suspend fun getRoomMessages(roomName: String): List<Message>? {
        return try {
            httpClient.get<List<Message>> {
                url("${HttpRoutes.MESSAGES}/$roomName")
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Get Messages Error 3xx", e.response.status.description)
            emptyList()
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Get Messages  Error 4xx", e.response.status.description)
            emptyList()
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Get Messages  Error 5xx", e.response.status.description)
            emptyList()
        } catch (e: Exception) {
            e.message?.let { Log.i("Get Messages  Error e", e.stackTraceToString()) }
            emptyList()
        }
    }

    override suspend fun getRoomsList(): MutableList<Room>? {
        return try {
            httpClient.get {
                url(HttpRoutes.ROOMS)
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Get Messages Error 3xx", e.response.status.description)
            mutableListOf()
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Get Messages  Error 4xx", e.response.status.description)
            mutableListOf()
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Get Messages  Error 5xx", e.response.status.description)
            mutableListOf()
        } catch (e: Exception) {
            e.message?.let { Log.i("Get Messages  Error e", e.stackTraceToString()) }
            mutableListOf()
        }
    }

    override suspend fun joinRoom(joinRoomRequest: JoinRoomRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.JOIN_ROOM)
                contentType(ContentType.Application.Json)
                body = joinRoomRequest
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("JOIN ROOM  Error 3xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("JOIN ROOM  Error 4xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("JOIN ROOM  Error 5xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("JOIN ROOM  Error e", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun joinDrawing(joinDrawingRequest: JoinDrawingRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.JOIN_DRAWING)
                contentType(ContentType.Application.Json)
                body = joinDrawingRequest
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("JOIN DRAWING 3xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("JOIN DRAWING  Error 4xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("JOIN DRAWING  Error 5xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("JOIN DRAWING  Error e", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun joinDrawing(joinDrawingRequestPass: JoinDrawingRequestPass): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.JOIN_DRAWING)
                contentType(ContentType.Application.Json)
                body = joinDrawingRequestPass
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("JOIN DRAWING 3xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("JOIN DRAWING  Error 4xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("JOIN DRAWING  Error 5xx", e.response.status.description)
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("JOIN DRAWING  Error e", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }





    override suspend fun getAllDrawings(): MutableList<Drawing>? {
        return try {
            httpClient.get {
                url(HttpRoutes.GET_ALL_DRAWINGS)
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Get Messages Error 3xx", e.response.status.description)
            mutableListOf()
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Get Messages  Error 4xx", e.response.status.description)
            mutableListOf()
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Get Messages  Error 5xx", e.response.status.description)
            mutableListOf()
        } catch (e: Exception) {
            e.message?.let { Log.i("Get Messages  Error e", e.stackTraceToString()) }
            mutableListOf()
        }
    }


    override suspend fun leaveRoom(leaveRoomRequest: LeaveRoomRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.LEAVE_ROOM)
                contentType(ContentType.Application.Json)
                body = leaveRoomRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("LEAVE ROOM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun getAllAlbums(): MutableList<Album>? {
        return try {
            httpClient.get {
                url(HttpRoutes.GET_ALL_ALBUMS)
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("GETALL ALBUMS ERROR", e.stackTraceToString()) }
            mutableListOf()
        }
    }


    override suspend fun createAlbum(createAlbumRequest: CreateAlbumRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.CREATE_ALBUM)
                contentType(ContentType.Application.Json)
                body = createAlbumRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("CREATE ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun deleteRoom(deleteRoomRequest: DeleteRoomRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.DELETE_ROOM)
                contentType(ContentType.Application.Json)
                body = deleteRoomRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("DELETE ROOM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun createRoom(createRoomRequest: CreateRoomRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.CREATE_ROOM)
                contentType(ContentType.Application.Json)
                body = createRoomRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("CREATE ROOM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun getDrawingsInAlbum(albumName: String): MutableList<Drawing>? {
        return try {
            httpClient.get {
                url("${HttpRoutes.GET_DRAWINGS_IN_ALBUM}/${albumName}")
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("GETDRAWFROM.ALBUM ERROR", e.stackTraceToString()) }
            mutableListOf()
        }
    }





    override suspend fun createDrawing(createDrawingRequest: CreateDrawingRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.CREATE_DRAWING)
                contentType(ContentType.Application.Json)
                body = createDrawingRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("CREATE DRAWING ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }



    override suspend fun createDrawing(createDrawingRequestProtected: CreateDrawingRequestProtected): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.CREATE_DRAWING)
                contentType(ContentType.Application.Json)
                body = createDrawingRequestProtected
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("CREATE DRAWING ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }





    override suspend fun addDrawing(addDrawingRequest: AddDrawingRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.ADD_DRAWING)
                contentType(ContentType.Application.Json)
                body = addDrawingRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("ADD DRAWING ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }



    override suspend fun leaveDrawing(leaveDrawingRequest: LeaveDrawingRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.LEAVE_DRAWING)
                contentType(ContentType.Application.Json)
                body = leaveDrawingRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("LEAVE DRAWING ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun joinAlbum(joinAlbumRequest: JoinAlbumRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.JOIN_ALBUM)
                contentType(ContentType.Application.Json)
                body = joinAlbumRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("JOIN ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun leaveAlbum(leaveAlbumRequest: LeaveAlbumRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.LEAVE_ALBUM)
                contentType(ContentType.Application.Json)
                body = leaveAlbumRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("LEAVE ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun deleteAlbum(deleteAlbumRequest: DeleteAlbumRequest): DeleteAlbumResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.DELETE_ALBUM)
                contentType(ContentType.Application.Json)
                body = deleteAlbumRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("DELETE ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                DeleteAlbumResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun deleteDrawing(deleteDrawingRequest: DeleteDrawingRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.DELETE_DRAWING)
                contentType(ContentType.Application.Json)
                body = deleteDrawingRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("DELETE DRAWING ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun updateAlbum(updateAlbumRequest: UpdateAlbumRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.UPDATE_ALBUM)
                contentType(ContentType.Application.Json)
                body = updateAlbumRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("UPDATE ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun updateAlbum(updateAlbumRequest: UpdateAlbumRequestNewName): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.UPDATE_ALBUM)
                contentType(ContentType.Application.Json)
                body = updateAlbumRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("UPDATE ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun updateDrawing(updateDrawingRequest: UpdateDrawingRequestNewName): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.UPDATE_DRAWING)
                contentType(ContentType.Application.Json)
                body = updateDrawingRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("UPDATE DRAWING ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun updateDrawing(updateDrawingRequest: UpdateDrawingRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.UPDATE_DRAWING)
                contentType(ContentType.Application.Json)
                body = updateDrawingRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("UPDATE DRAWING ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun addRequestAlbum(addRequestAlbum: AddRequestAlbum): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.ADD_REQUEST_ALBUM)
                contentType(ContentType.Application.Json)
                body = addRequestAlbum
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("ADD REQUEST ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }

    override suspend fun acceptRequestAlbum(acceptRequestAlbum: AcceptRequestAlbum): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.ACCEPT_REQUEST_ALBUM)
                contentType(ContentType.Application.Json)
                body = acceptRequestAlbum
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("ACC REQ ALBUM ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }




    override suspend fun changePassword(changePasswordRequest: ChangePasswordRequest): MessageResponse? {
        return try {
            httpClient.post {
                url(HttpRoutes.CHANGE_PASSWORD)
                contentType(ContentType.Application.Json)
                body = changePasswordRequest
            }
        } catch (e: Exception) {
            e.message?.let { Log.i("CHANGE PASSWORD ERROR", e.stackTraceToString()) }
            e.message?.let {
                MessageResponse(
                    it.substring(
                        e.message!!.indexOf("\""),
                        e.message!!.lastIndexOf("\"")
                    )
                )
            }
        }
    }


    override suspend fun addFriend(addFriendRequest: AddFriendRequest): AddFriendResponse? {
        return try {
            httpClient.post<AddFriendResponse> {
                url(HttpRoutes.ADD_FRIEND)
                contentType(ContentType.Application.Json)
                body = addFriendRequest
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Add friend Error 3xx", e.response.status.description)
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), AddFriendResponse::class.java
            )
            AddFriendResponse(tempResponse.message)
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Add friend Error 4xx", e.response.status.description)
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), AddFriendResponse::class.java
            )
            AddFriendResponse(tempResponse.message)
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Add friend Error 5xx", e.toString())
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), AddFriendResponse::class.java
            )
            AddFriendResponse(tempResponse.message)
        } catch (e: Exception) {
            Log.i("Login Error e", e.stackTraceToString())
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), AddFriendResponse::class.java
            )
            AddFriendResponse(tempResponse.message)
        }
    }

    override suspend fun removeFriend(removeFriendRequest: RemoveFriendRequest): RemoveFriendResponse? {
        return try {
            httpClient.post<RemoveFriendResponse> {
                url(HttpRoutes.REMOVE_FRIEND)
                contentType(ContentType.Application.Json)
                body = removeFriendRequest
            }
        } catch (e: RedirectResponseException) {
            // 3xx - responses
            Log.i("Remove friend Error 3xx", e.response.status.description)
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), RemoveFriendResponse::class.java
            )
            RemoveFriendResponse(tempResponse.message)
        } catch (e: ClientRequestException) {
            // 4xx - responses
            Log.i("Remove friend Error 4xx", e.response.status.description)
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), AddFriendResponse::class.java
            )
            RemoveFriendResponse(tempResponse.message)
        } catch (e: ServerResponseException) {
            // 5xx - responses
            Log.i("Remove friend Error 5xx", e.toString())
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), AddFriendResponse::class.java
            )
            RemoveFriendResponse(tempResponse.message)
        } catch (e: Exception) {
            Log.i("Remove Error e", e.stackTraceToString())
            val tempResponse = gson.fromJson(
                e.message!!.substring(
                    e.message!!.indexOf("\"") + 1,
                    e.message!!.lastIndexOf("\"")
                ), AddFriendResponse::class.java
            )
            RemoveFriendResponse(tempResponse.message)
        }
    }


}