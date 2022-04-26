
import { Socket } from "socket.io";
import { Room } from "../class/Room";
import { User } from "../class/User";
import { SOCKETEVENT } from "../Constants/socketEvent";
import RoomSchema from "../Entities/RoomSchema";
import { MessageInterface } from "../Interface/Message";
import databaseService from "./databaseService";
import socketService from "./socketService";
import userService from "./userService";


export class RoomService {

  private rooms=new Map<String,Room>(); // roomName and room
  private socketidToEmail=new Map<string,String>(); // socketid and useremail
  private socketToRoom=new Map<string,string>(); //socketid and roomName 

  constructor() {
    this.createDefaultRoom();
  }



  /***** main chat room ********/
  async createDefaultRoom() {
    await this.loadAllRoom();
    if(this.rooms.has("DEFAULT")==false) {
      const roomName="DEFAULT";
      const creator="ADMIN";
      let members:String[]=[];
      let messages:MessageInterface[]=[];
      members.push("admin");
      this.createRoom(roomName,creator,members,messages);
      console.log("roomservice created");
    }
    else {
      console.log("DEFAULT room already created");
    }
  }

  getDefaultRoom():Room {
    return this.rooms.get("DEFAULT") as Room;
  }

  async loadAllRoom() {
    this.rooms.clear();
    await databaseService.getAllRooms().then((rooms)=>{
      rooms.forEach((room)=>{
        let roomObj:Room=new Room(room.roomName,room.creator,room.members,room.messages);
        this.rooms.set(roomObj.getRoomName(),roomObj);
      })
    }).catch((e:Error)=>{
        console.log(e);
    });
  }

  async createRoom(name:String,creatorName:String,members:String[],messages:MessageInterface[]) {
    try {
      const room=new RoomSchema({roomName:name,creator:creatorName,members:members,messages:messages});
      await room.save();
      console.log("room saved");
      const roomObj=new Room(name,creatorName,members,messages);
      this.rooms.set(name,roomObj);
    }
    catch(error) {
      console.log(error);
    }
  }

  getAllRooms():Map<String,Room> {
    return this.rooms;
  }

  /************** set socketId and useremail **********************/
  setSocketIdAndEmail(socketId:string,email:String) {
    if(this.socketidToEmail.has(socketId)==false) {
      this.socketidToEmail.set(socketId,email);
    }
  }

  /************** returns useremail using socketId key ************/
  getUseremailBySocketId(socketId:string) {
    if(this.socketidToEmail.has(socketId)) {
      return this.socketidToEmail.get(socketId);
    }
    let message:String="useremail not found";
    return message;
  }

  /************** set socketId and roomname to map ***************/
  setUserSocketIdAndRoom(socketId:string,roomName:string) {
    if(this.socketToRoom.has(socketId)==false) {
        this.socketToRoom.set(socketId,roomName);
    }
  }

  getSocketsRoomNames():Map<string,string> {
    return this.socketToRoom;
  }

  /************** returns the roomname using the socketid key ****************/
  getRoomNameBySocket(socketId:string) {
    if(this.socketToRoom.has(socketId)) {
      return this.socketToRoom.get(socketId);
    }
    let message:String="roomname not found";
    return message;
  }

  getRoomByName(name:String) {
    if(this.rooms.has(name)) {
      return this.rooms.get(name) as Room;
    }
    let message:string="room does not exists";
    return message;
  }

  kickUserFromRoom(name:String) {
    this.socketToRoom.forEach((v,k)=>{
      if(v==name) {
        let socket=socketService.getIo().sockets.sockets.get(k);
        socket?.leave(v);
        this.socketToRoom.delete(k);
      }
    });
    console.log(this.socketToRoom);
  }

  async deleteRoom(name:String) {
      try {
         await RoomSchema.deleteOne({roomName:name}).then((data)=>{
           console.log(data);
           this.rooms.delete(name);
           this.kickUserFromRoom(name);
           const message={message:"room deleted"};
           socketService.getIo().emit(SOCKETEVENT.ROOMDELETED,JSON.stringify(message));
         });
       }
       catch(error) {
         console.log(error);
      }
  }

  joinRoom(name:String,useremail:String) {
    let user:User=userService.getUserByUseremail(useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;
    let nextRoom:Room=this.getRoomByName(name) as Room;

    let socket=socketService.getIo().sockets.sockets.get(socketId);
       
    nextRoom?.addUserToRoom(useremail);

    if(this.getSocketsRoomNames().has(socket?.id as string)) {
        this.getSocketsRoomNames().delete(socket?.id as string); // delete to set current room
    }
    this.getSocketsRoomNames().set(socket?.id as string,nextRoom?.getRoomName() as string); // current chat room

    const joinRoomNotification={useremail:useremail,roomName:name};

    socket?.join(nextRoom?.getRoomName() as string);

    socketService.getIo().emit(SOCKETEVENT.JOINROOM,JSON.stringify(joinRoomNotification));
    console.log("ROOM CHANGE:"+nextRoom?.getRoomName());
  }

  leaveRoom(socket:Socket,roomToLeave:String,useremail:String) {
    socket?.leave(roomToLeave as string);   
    let room:Room=this.rooms.get(roomToLeave) as Room;
    room.removeUserFromRoom(useremail);  // removes user from room members
    this.rooms[`${room.getRoomName()}`]=room;
    if(this.socketToRoom.get(socket?.id)==roomToLeave) {
      this.socketToRoom.delete(socket?.id);
    }
    console.log("leave room:",room.getRoomName());
    const message={useremail:useremail,roomName:roomToLeave};
    socketService.getIo().emit(SOCKETEVENT.LEAVEROOM,JSON.stringify(message));
  }

  async updateRoomName(newName:String,roomName:String) {
    let oldName:String=roomName;
    let room:Room=this.rooms.get(roomName) as Room;
    const filter={roomName:room.getRoomName()};
    const roomUpdate = {
         $set:{
           "roomName":newName
         }
     };
    try {
      let roomDoc=await RoomSchema.findOne(filter);
      await RoomSchema.updateOne(filter,roomUpdate).catch((e:Error)=>{
        console.log(e);
      });
      await roomDoc?.save().then(()=>{
        room.setRoomName(newName);
        this.rooms.delete(oldName);
        this.rooms.set(room.getRoomName(),room);
        this.socketToRoom.forEach((v,k)=>{
          if(v==oldName) {
            this.socketToRoom[k]=room.getRoomName();
            let socket=socketService.getIo().sockets.sockets.get(k);
            socket?.leave(oldName as string);
            socket?.join(room.getRoomName() as string);
          }
        });
        const message={oldName:oldName,room:room};
        socketService.getIo().emit(SOCKETEVENT.ROOMMODIFIED,JSON.stringify(message));
      }).catch((e:Error)=>{
        console.log(e);
      });
    }
    catch(e) {
      console.log(e);
    }
  }

  parseObject(arg: any): Object {
    if ((!!arg) && arg.constructor === Object) {
        return arg
    } else {
        try {
            return JSON.parse(arg);
        } catch(E){
            return {};
        }
    }
  }
  

}

const roomService=new RoomService();
export default roomService;
