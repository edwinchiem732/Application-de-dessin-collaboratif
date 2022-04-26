package com.example.colorimage.http

import io.ktor.client.*
import io.ktor.client.engine.android.*
import io.ktor.client.features.json.*
import io.ktor.client.features.json.serializer.*
import io.ktor.client.features.logging.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonConfiguration


/////////////
////LOGIN////
/////////////
@Serializable
data class LoginRequest(
    val useremail: String,
    val password: String,
)
@Serializable
data class LoginResponse(
    val message: String,
    val user: UserProfilObj?,
    val currentRoom: String?,
)


//////////////
////LOGOUT////
//////////////
@Serializable
data class LogoutRequest(
    val useremail: String,
)



/////////////////
////JOIN ROOM////
/////////////////
@Serializable
data class JoinRoomRequest(
    val newRoomName: String,
    val user: UserObj,
)


///////////////////
////DELETE ROOM////
///////////////////
@Serializable
data class DeleteRoomRequest(
    val roomName: String,
)


///////////////////
////CREATE ROOM////
///////////////////
@Serializable
data class CreateRoomRequest(
    val roomName: String,
    val creator: String
)


////////////////
////REGISTER////
////////////////
@Serializable
data class RegisterRequest(
    val useremail: String,
    val password: String,
    val nickname: String,
    val avatar: String
)
@Serializable
data class RegisterResponse(
    val message: String,
    val status: String?,
)


////////////////////
////JOIN_DRAWING////
////////////////////
@Serializable
data class JoinDrawingRequest(
    val useremail: String,
    val drawingName: String,
)

@Serializable
data class JoinDrawingRequestPass(
    val useremail: String,
    val drawingName: String,
    val password: String
)


//////////////////
////LEAVE_ROOM////
//////////////////
@Serializable
data class LeaveRoomRequest (
    val useremail: String,
    val roomName: String,
)


////////////////////
////CREATE_ALBUM////
////////////////////
@Serializable
data class CreateAlbumRequest(
    val albumName: String,
    val creator: String,
    val visibility: String,
    val description: String,
)


////////////////////
////JOIN_ALBUM////
////////////////////
@Serializable
data class  JoinAlbumRequest(
    val albumName: String,
    val useremail: String
)


////////////////////
////LEAVE_ALBUM////
////////////////////
@Serializable
data class  LeaveAlbumRequest(
    val albumName: String,
    val member: String
)


//////////////////////
////CREATE_DRAWING////
//////////////////////
@Serializable
data class CreateDrawingRequest(
    val drawingName: String,
    val owner: String,
    val visibility: String
)

@Serializable
data class CreateDrawingRequestProtected(
    val drawingName: String,
    val owner: String,
    val visibility: String,
    val password: String
)

//////////////////////
////ADD_DRAWING////
//////////////////////
@Serializable
data class AddDrawingRequest(
    val drawingName: String,
    val useremail: String,
    val albumName: String
)


//////////////////////
////DELETE_DRAWING////
//////////////////////
@Serializable
data class DeleteDrawingRequest(
    val drawingName: String,
)

//////////////////////
////DELETE_ALBUM////
//////////////////////
@Serializable
data class DeleteAlbumRequest(
    val useremail: String,
    val albumName: String
)
@Serializable
data class DeleteAlbumResponse(
    val message: String,
)

//////////////////////
////LEAVE_DRAWING////
//////////////////////
@Serializable
data class LeaveDrawingRequest(
    val useremail: String,
)

//////////////////////
////UPDATE_ALBUM////
//////////////////////
@Serializable
data class UpdateAlbumRequestNewName(
    val newName: String,
    val useremail: String,
    val album: AlbumData,
)

@Serializable
data class UpdateAlbumRequest (
    val useremail: String,
    val album: AlbumData,
)


//////////////////////
////CHANGE PASSWORD////
//////////////////////
@Serializable
data class ChangePasswordRequest(
    val useremail: String,
    val drawingName: String,
    val newPassword: String
)

//////////////////////
////UPDATE_DRAWING////
//////////////////////
@Serializable
data class UpdateDrawingRequestNewName(
    val newName: String,
    val useremail: String,
    val drawing: DrawingData,
)


@Serializable
data class UpdateDrawingRequest (
    val useremail: String,
    val drawing: DrawingData,
)

//////////////////////
////ADD_REQUEST_ALBUM////
//////////////////////
@Serializable
data class AddRequestAlbum(
    val newMember: String,
    val albumName: String,
)


//////////////////////////
////ACCEPT_REQUEST_ALBUMS////
//////////////////////////
@Serializable
data class AcceptRequestAlbum(
    val useremail: String,
    val request: String,
    val albumName: String,
)


//////////////////
////ALBUM_DATA////
//////////////////
@Serializable
data class AlbumData(
    val albumName: String,
    val description: String
)

//////////////////
////DRAWING_DATA////
//////////////////
@Serializable
data class DrawingData(
    val drawingName: String,
    val visibility: String
)

//////////////////////
////MESSAGE_RESPONSE////
//////////////////////
@Serializable
data class MessageResponse(
    val message: String,
)

@Serializable
data class AddFriendRequest(
    val newFriend: String,
    val targetUser: String,
)

@Serializable
data class AddFriendResponse(
    val message: String,
)

@Serializable
data class RemoveFriendRequest(
    val useremail: String,
    val friendToRemove: String,
)

@Serializable
data class RemoveFriendResponse(
    val message: String,
)


//////////////////
////INTERFACES////
//////////////////
@Serializable
data class Message(
    val time: String,
    val nickname: String,
    val message: String
)

@Serializable
data class Album (
    val albumName:String,
    val creator:String,
    val drawings:Array<String>? = emptyArray(),
    val visibility:String,
    val dateCreation:Long,
    val description:String?,
    val members:Array<String>? = emptyArray(),
    val requests:Array<String>? = emptyArray()
)


@Serializable
data class Room (
    var members: Array<String>? = emptyArray(),
    var roomName: String? = null,
    var creator: String? = null,
    var messages: Array<Message>? = emptyArray()
)

@Serializable
data class UserObj(
    val useremail: String,
    val nickname: String,
)

@Serializable
data class UserProfilObj(
    val useremail: String,
    val nickname: String,
    val lastLoggedIn: String? = "",
    val lastLoggedOut: String? = "",
    val friends: Array<String>? = emptyArray(),
    val avatar: String? = "",
)

@Serializable
data class Drawing(
    val drawingName: String,
    val owner: String,
    val elements: Array<BaseShapeInterface>? = emptyArray(),
    val roomName: String,
    val members: Array<String>? = emptyArray(),
    val visibility: String,
    val creationDate: Long,
    val likes: Array<String>? = emptyArray()
)




@Serializable
data class BaseShapeInterface (
    val id: String? = "",
    val user: String? = "",
    val strokeWidth: Int? = 1,
    val fill: String? = "",
    val stroke: String? = "",
    val fillOpacity: String? = "",
    val strokeOpacity: String? = "",
    val x: Int? = 0,
    val y: Int? = 0,
    val finalX: Int? = 0,
    val finalY: Int? = 0,
    val width: Int? = 0,
    val height: Int? = 0,
    val type: String? = "",
    val pointsList: Array<Point>? = emptyArray(),
)

@Serializable
data class Point(val x: Int = 0, val y: Int = 0) {


    override fun toString(): String {
        return "Point [" +
                "x=" + x +
                ", y=" + y +
                ']'
    }
}



interface HttpService {

    suspend fun login(loginRequest: LoginRequest): LoginResponse?

    suspend fun logout(logoutRequest: LogoutRequest): MessageResponse?

    suspend fun register(registerRequest: RegisterRequest): RegisterResponse?

    suspend fun getRoomMessages(roomName: String): List<Message>?

    suspend fun getRoomsList(): MutableList<Room>?

    suspend fun joinRoom(joinRoomRequest: JoinRoomRequest): MessageResponse?

    suspend fun joinDrawing(joinRoomRequest: JoinDrawingRequest): MessageResponse?

    suspend fun joinDrawing(joinRoomRequestPass: JoinDrawingRequestPass): MessageResponse?

    suspend fun getAllDrawings(): MutableList<Drawing>?

    suspend fun deleteRoom(deleteRoomRequest: DeleteRoomRequest): MessageResponse?

    suspend fun createRoom(createRoomRequest: CreateRoomRequest): MessageResponse?

    suspend fun leaveRoom(leaveRoomRequest: LeaveRoomRequest): MessageResponse?

    suspend fun getAllAlbums(): MutableList<Album>?

    suspend fun createAlbum(createAlbumRequest: CreateAlbumRequest): MessageResponse?

    suspend fun getDrawingsInAlbum(albumName: String): MutableList<Drawing>?

    suspend fun createDrawing(createDrawingRequest: CreateDrawingRequest): MessageResponse?

    suspend fun createDrawing(createDrawingRequestProtected: CreateDrawingRequestProtected): MessageResponse?

    suspend fun addDrawing(addDrawingRequest: AddDrawingRequest): MessageResponse?

    suspend fun leaveDrawing(leaveDrawingRequest: LeaveDrawingRequest): MessageResponse?

    suspend fun joinAlbum(joinAlbumRequest: JoinAlbumRequest): MessageResponse?

    suspend fun leaveAlbum(leaveAlbumRequest: LeaveAlbumRequest): MessageResponse?

    suspend fun deleteAlbum(deleteAlbumRequest: DeleteAlbumRequest): DeleteAlbumResponse?

    suspend fun deleteDrawing(deleteDrawingRequest: DeleteDrawingRequest): MessageResponse?

    suspend fun updateAlbum(updateAlbumRequest: UpdateAlbumRequest): MessageResponse?

    suspend fun updateAlbum(updateAlbumRequest: UpdateAlbumRequestNewName): MessageResponse?

    suspend fun updateDrawing(updateDrawingRequest: UpdateDrawingRequestNewName): MessageResponse?

    suspend fun updateDrawing(updateDrawingRequest: UpdateDrawingRequest): MessageResponse?

    suspend fun addRequestAlbum(addRequestAlbum: AddRequestAlbum): MessageResponse?

    suspend fun acceptRequestAlbum(acceptRequestAlbum: AcceptRequestAlbum): MessageResponse?

    suspend fun changePassword(changePasswordRequest: ChangePasswordRequest): MessageResponse?
    suspend fun addFriend(addFriendRequest: AddFriendRequest): AddFriendResponse?

    suspend fun removeFriend(removeFriendRequest: RemoveFriendRequest): RemoveFriendResponse?


    companion object {
        fun create(): HttpService {
            return HttpServiceImplementation(
                httpClient = HttpClient(Android) {
                    install(Logging) {
                        level = LogLevel.ALL
                    }
                    install(JsonFeature) {
                        serializer = KotlinxSerializer(kotlinx.serialization.json.Json {
                            prettyPrint = true
                            isLenient = true
                            allowSpecialFloatingPointValues = true
                            encodeDefaults = true
                            ignoreUnknownKeys = true
                            explicitNulls = false
                            coerceInputValues = true
                        })
                    }
                }
            )
        }
    }
}