import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { URL } from '../../../../constants';
//import { UserService } from '@app/services/fetch-users/user.service';


@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket: Socket;
  public nickname: string;
  public email: string;
  public isConnected: boolean;
  public currentRoom: string;
  public drawingName: string;
  public albumName: string;
  public onGoing: boolean;
  public memberRequest: string;
  public language = "french";
  public theme = "light grey";
  public mute = false;
  public avatarNumber = "";
  public userObj = {
    useremail: "",
    nickname:"",
    lastLoggedIn: 0,
    lastLoggedOut: 0,
    friends: [""],
    avatar: this.avatarNumber , 
  }
  public test: string;
  public clickedDrawing: string;
  public he: number;
  public avatar2: string;
  public avatarClick = false;
  public isProtected: boolean;
  public filtered: boolean;
  public buttons:Array<string> = [];
  public members: Array<string>;
  public currVisib: string;
  public drawingNameChange: boolean = false;
  //private userService: UserService;

  constructor() { }

  initSocket(): void {
    console.log("socket initiation");
    this.socket=io(//'https://projet3-3990-207.herokuapp.com/', {
      URL, {
      reconnectionAttempts: 2,
      transports : ['websocket'],
      query:{useremail:this.email}
    })
    this.socket.on("connected",(data)=>{
      console.log(data);
    })
  
    const user = { useremail: this.email };
    this.socket.emit("connection", JSON.stringify(user));
  }

  disconnectSocket() {
    this.socket.on("DISCONNECT",(data)=>{  // event pour deconnecter le socket d'un user
      data=JSON.parse(data);  // data={message:"success"}
      console.log("disconnect");
      console.log(data);
    });

    const user = { useremail: this.email }
    this.socket.emit("DISCONNECT",JSON.stringify(user));
  }

  joinRoom(room: string) {
    this.socket.on("JOINROOM",(data)=>{  // evenement pour join un room
      data=JSON.parse(data);           // OUBLIER PAS DE PARSE direct quand vous recevez 
      console.log(data);
      //this.currentRoom = data.currentRoomName;
    });
    const newRoom = { newRoomName: room, oldRoomName: this.currentRoom, useremail:this.email};
    console.log(room);
    console.log(this.currentRoom.trim());
    console.log("LIS MOI BRO" + this.email);
    this.socket.emit("JOINROOM",JSON.stringify(newRoom)); // OUBLIER PAS DE STRINGIFY avant de emit
  }

  roomDeleted(room: string) {
    this.socket.on("ROOMDELETED",(data)=>{ 
      data=JSON.parse(data);           // OUBLIER PAS DE PARSE direct quand vous recevez 
      console.log(data);
    });
  }

  getSocket() {
    return this.socket;
  }
}

