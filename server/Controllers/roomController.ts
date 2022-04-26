import express, { NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';
import { Room } from '../class/Room';
import { User } from '../class/User';
import { HTTPMESSAGE } from '../Constants/httpMessage';
import { SOCKETEVENT } from '../Constants/socketEvent';
import { MessageInterface } from '../Interface/Message';
import { UserInterface } from '../Interface/User';
import roomService from '../Services/roomService';
import socketService from '../Services/socketService';
import userService from '../Services/userService';


const router = express.Router();

const getRooms=(req:Request,res:Response,next:NextFunction)=>{
    let rooms:Room[]=[];
    roomService.getAllRooms().forEach((v,k)=>{
       rooms.push(v);
    })
    return res.status(200).json(rooms);
}


const joinRoom=(req:Request,res:Response,next:NextFunction)=>{
    
    let userInterface:UserInterface=req.body.user as UserInterface;
    let newRoom:String=req.body.newRoomName as String;
    let useremail:String=userInterface.useremail as String;
   
    if(roomService.getAllRooms().has(newRoom)) {
        roomService.joinRoom(newRoom,useremail);
        const message={message:HTTPMESSAGE.SUCCESS};
        return res.status(200).json(message);
    }
    const message={message:HTTPMESSAGE.FAILED}
    return res.status(404).json(message);
}

const leaveRoom=(req:Request,res:Response,next:NextFunction)=>{

   let useremail:String=req.body.useremail as String;
   let roomToLeave:String=req.body.roomName as String;

   let user:User=userService.getUserByUseremail(useremail) as User;

   if(userService.getSocketIdByUser().has(user)) {
     let socketId:string=userService.getSocketIdByUser().get(user) as string;
     let socket:Socket=socketService.getIo().sockets.sockets.get(socketId) as Socket;

     if(roomService.getAllRooms().has(roomToLeave)) {
       roomService.leaveRoom(socket,roomToLeave,useremail);
       return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
     }
     return res.status(404).json({message:HTTPMESSAGE.RNOTFOUND});
   }
   return res.status(404).json({message:HTTPMESSAGE.FAILED});
}


const createRoom=(req:Request,res:Response,next:NextFunction)=>{
    console.log(req.body.roomName);
    console.log(req.body.creator);
    let roomName:String=req.body.roomName as String;
    let creator:String=req.body.creator as String;
    let members:String[]=[];
    let messages:MessageInterface[]=[];

    const user:User=userService.getUserByUseremail(creator) as User;

    let socketId:string=userService.getSocketIdByUser().get(user) as string;
    console.log(socketId);
   
    if(roomService.getAllRooms().has(roomName)) {
        console.log("room already exists");
        return res.status(404).json({message:HTTPMESSAGE.FAILED});
    }
    
    roomService.createRoom(roomName,creator,members,messages).then(()=>{
        const message={message:"room created"};
        socketService.getIo().emit(SOCKETEVENT.CREATEROOM,JSON.stringify(message));
    }).catch((e:Error)=>{
        console.log(e);
    });
    return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
}

const deleteRoom=(req:Request,res:Response,next:NextFunction)=>{
   let roomName:String=req.body.roomName as String;
   if(roomService.getAllRooms().has(roomName)==false) {
     return res.status(404).json({message:HTTPMESSAGE.FAILED});
   }
   if(roomName!=roomService.getDefaultRoom().getRoomName()) {
    roomService.deleteRoom(roomName).catch((e:Error)=>{
        console.log(e);
    });
    return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
   }
   return res.status(404).json({message:HTTPMESSAGE.FAILED});
   
  
}

router.get('/getAllRooms',getRooms);
router.post('/joinRoom',joinRoom);
router.post('/leaveRoom',leaveRoom);
router.post('/createRoom',createRoom);
router.post('/deleteRoom',deleteRoom);

export=router;