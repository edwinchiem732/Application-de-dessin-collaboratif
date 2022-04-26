import express, { NextFunction, Request, Response } from 'express';
import userService from '../Services/userService';
import { Account } from '../class/Account';
import { User } from '../class/User';
import roomService from '../Services/roomService';
import { HTTPMESSAGE } from '../Constants/httpMessage';
import socketService from '../Services/socketService';
import { Socket } from 'socket.io';
import accountService from '../Services/accountService';
import drawingService from '../Services/drawingService';



let bcrypt=require("bcryptjs");

const router = express.Router();

const createUser=async (req:Request,res:Response,next:NextFunction)=>{
  req.body.useremail=req.body.useremail as String;

    console.log("does account exists ? "+accountService.getAccounts().has(req.body.useremail as String));
    if(req.body.useremail && req.body.password && req.body.nickname && req.body.avatar) {
      if(accountService.getAccounts().has(req.body.useremail)) {
         console.log("user already exists");
         const message={message:HTTPMESSAGE.FAILED};
         return res.status(404).json(message);
      }    
     const salt=await bcrypt.genSalt();
     const hashedPassword=await bcrypt.hash(req.body.password,salt);
  
     accountService.createAccount(req.body.useremail,hashedPassword,req.body.nickname,req.body.avatar);
     const message={message:HTTPMESSAGE.SUCCESS};
     return res.status(200).json(message);
  }
  else if(!req.body.useremail) {
    const message={message:HTTPMESSAGE.MAILUND};
    console.log("error undefined email");
    return res.status(404).json(message);
  }
  const message={message:HTTPMESSAGE.FAILED};
  return res.status(404).json(message);
}

const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
    const account=accountService.getAccount(req.body.useremail as String) as Account;
    console.log(req.body.useremail as String);
    if(account==null) {
        return res.status(400).json({message:HTTPMESSAGE.UNOTFOUND});
    }
    if(userService.getLoggedUsers().has(account.getUserEmail() as string)) {
        return res.status(404).json({message:HTTPMESSAGE.UCONNECTED})
    }
    else {
      try {
        if(await bcrypt.compare(req.body.password,account.getUserPassword() as string)) {
          const userFound:User=userService.getUsers().find((user)=>user.getUseremail()==account.getUserEmail()) as User;
          let date:Number=Date.now();
          userFound.setLastLoggedIn(date);
          userService.getLoggedUsers().set(userFound.getUseremail(),userFound);
       
          let defaultRoomName:String=roomService.getDefaultRoom().getRoomName() as String;
          return res.status(200).json({message:HTTPMESSAGE.SUCCESS,user:userFound,currentRoom:defaultRoomName});
        }
        else {
          return res.status(404).json({message:HTTPMESSAGE.PASSNOTMATCH});
        }
      }
      catch(e) {
        console.log(e);
        return res.status(404).json(e);
      }
    }
}

const logoutUser=async(req:Request,res:Response,next:NextFunction)=>{
    let useremail:String=req.body.useremail;
    
    let user:User=userService.getUserByUseremail(useremail) as User;
    let socketId:string=userService.getSocketIdByUser().get(user) as string;
    let socket:Socket=socketService.getIo().sockets.sockets.get(socketId) as Socket;

    console.log(useremail+" wants to loggout");
    console.log("user in map for logout ? "+userService.getLoggedUsers().has(useremail))
    if(userService.getLoggedUsers().has(useremail)) {
        if(drawingService.socketInDrawing.has(socketId)) {
          drawingService.leaveDrawing(socket,user?.getUseremail());
        }
        roomService.getAllRooms().forEach((v,k)=>{
          if(v.getUsersInRoom().indexOf(useremail)!=-1) {
            roomService.leaveRoom(socket,k,useremail);
          }
        })
        socket?.disconnect();
        let date:Number=Date.now();
        user.setLastLoggedOut(date);
        userService.updateUser(user);
        userService.deleteEntryContainer(user.getUseremail(),socketId,user);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS})
    }
    return res.status(404).json({message:HTTPMESSAGE.UNOTFOUND});
}


const addFriend=async(req:Request,res:Response,next:NextFunction)=>{
  let newFriend:String=req.body.newFriend as String;
  let targetUser:String=req.body.targetUser as String;

  let newFriendObj:User=userService.getUsers().find((user)=>user.getUseremail()==newFriend) as User;

  if(userService.getUsers().find((user)=>user.getUseremail()==targetUser) as User) {
    let user:User=userService.getUsers().find((user)=>user.getUseremail()==targetUser) as User;
    if(user.getFriends().indexOf(newFriend)!=-1 || newFriendObj.getFriends().indexOf(targetUser)!=-1) {
      return res.status(404).json({message:HTTPMESSAGE.ALREADYF});
    }
    await userService.addFriend(newFriendObj,user);
    return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
  }

  return res.status(404).json({message:HTTPMESSAGE.UNOTFOUND});
}

const removeFriend=async(req:Request,res:Response,next:NextFunction)=>{
 let useremail:String=req.body.useremail as String;
 let friendToRemove:String=req.body.friendToRemove as String;
 if(userService.getUsers().find((user)=>user.getUseremail()==useremail) as User) {
   let friend:User=userService.getUsers().find((user)=>user.getUseremail()==friendToRemove) as User;
   let user:User=userService.getUsers().find((user)=>user.getUseremail()==useremail) as User;
   if(user.getFriends().indexOf(friendToRemove)!=-1 && friend.getFriends().indexOf(useremail)!=-1) {
     await userService.removeFriend(friendToRemove,useremail);
     return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
   }
   return res.status(404).json({message:HTTPMESSAGE.FNOTFOUND});
 }
 return res.status(404).json({message:HTTPMESSAGE.UNOTFOUND});
}



router.post('/registerUser',createUser);
router.post('/loginUser',loginUser);
router.post('/logoutUser',logoutUser);
router.post('/addFriend',addFriend);
router.post('/removeFriend',removeFriend);

export=router;
