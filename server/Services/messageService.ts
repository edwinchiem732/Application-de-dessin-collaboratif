
import { Socket,Server } from "socket.io";
import { Message } from "../class/Message";
import { User } from "../class/User";
import { SOCKETEVENT } from "../Constants/socketEvent";
import RoomSchema from "../Entities/RoomSchema";
import { MessageInterface } from "../Interface/Message";
import roomService from "./roomService";
import userService from "./userService";


class MessageService {

    constructor() {
      
    }

    private messages:Array<Message>=[];
    private io:Server;

    /***************** socket section ****************/
    initChat(server:Server) {
      this.io=server;
      this.connect();
    }

    connect():void {
      this.io.on("connection",(socket:Socket)=>{
        /***************** add user to connected users *****************/
        let useremail:String=socket.handshake.query.useremail as String;
        console.log("query email:"+useremail);
        
        /***************** set socket id to default room during connection ***************/
        roomService.setSocketIdAndEmail(socket.id,useremail);
        if(!roomService.getDefaultRoom()) {
          roomService.createDefaultRoom();
        }
        
        const user:User=userService.getUserByUseremail(useremail) as User;

        userService.getSocketIdByUser().set(user,socket.id);
        userService.getUsersBySocketId().set(socket.id,user);

        if(roomService.getDefaultRoom()) {
           roomService.setUserSocketIdAndRoom(socket.id,roomService.getDefaultRoom().getRoomName() as string);
        }

        /****************** join current room during connection *****************/
        socket.join(roomService.getRoomNameBySocket(socket.id) as string);
        console.log("user "+useremail+" with socket id:"+socket.id+" is connected to the chat");
        
        this.sendMessage(socket);
        this.disconnect(socket);
      });
      
    }


    sendMessage(socket:Socket) {
      socket.on(SOCKETEVENT.MESSAGE,async (data)=> {    // listen for event named random with data
        data = this.parseObject(data);
        console.log(data);

        let roomName:String=roomService.getRoomNameBySocket(socket.id) as String;
        this.UpdateRoomMessages(roomName,data);
        const msg={roomName:roomName,msg:data}
        socket.broadcast.to(roomService.getRoomNameBySocket(socket.id) as string).emit(SOCKETEVENT.MESSAGE,JSON.stringify(msg));  // send msg to all listener listening to room1 the right side json
      })
    }

  
    disconnect(socket:Socket) {
      socket.on(SOCKETEVENT.DISCONNECT,(data)=>{
        data=this.parseObject(data);
        let email:string=data.useremail as string;
        const res={message:"success"};    
        socket.emit(SOCKETEVENT.DISCONNECT,JSON.stringify(res));
        console.log('user '+email+" just disconnected from chat !");
        socket.disconnect();
      });
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


    /************************** HTTP section *************************/

    getMessages():Array<Message> {
        return this.messages;
    }

    async UpdateRoomMessages(name:String,msg:MessageInterface) {
      if(roomService.getAllRooms().has(name)) {
        const messagesUpdate = {
         $push: {
           "messages": msg
         }
        };
        try {
          RoomSchema.findOneAndUpdate({roomName:name},messagesUpdate).then((data)=>{
            console.log(data?.roomName+" messages updated");
            roomService.getAllRooms().get(name)?.addMessageToRoom(msg);
          }).catch((error)=>{
            console.log(error);
          });
        }
        catch(error) {
          console.log(error);
        }
      }
    }
 
   
 
 }
 
 const messageService=new MessageService();
 export default messageService;