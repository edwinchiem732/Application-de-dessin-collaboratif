import { User } from "../class/User";
import { SOCKETEVENT } from "../Constants/socketEvent";
import UserSchema from "../Entities/UserSchema";
import databaseService from "./databaseService";
import socketService from "./socketService";


class UserService {
   constructor() {
       this.loadAllUsers();
   } 

   private users:User[]=[];

   public loggedUsers=new Map<String,User>(); // useremail and user
   private userBySocketId=new Map<string,User>();
   private socketIdByUser=new Map<User,string>();


   /********** All users *************/
   async loadAllUsers() {
       this.users=[];
       await databaseService.getAllUsers().then((users)=>{
           users.forEach((user)=>{
               let userObj=new User(user.useremail,user.nickname,user.avatar,user.friends);
               userObj.setLastLoggedIn(user.lastLoggedIn);
               userObj.setLastLoggedOut(user.lastLoggedOut);
               this.users.push(userObj);
           })
       })
    }

   getUsers():User[] {
       return this.users;
   }

   getUsersBySocketId():Map<string,User> {
       return this.userBySocketId;
   }

   getSocketIdByUser():Map<User,string> {
       return this.socketIdByUser;
   }

   getUserByUseremail(email:String) {
       return this.users.find((user)=>user.getUseremail()==email);
   }


   /********** users logged in **************/
   getLoggedUsers():Map<String,User> {
       return this.loggedUsers;
   }


   async updateUser(user:User) {
       const filter={
           useremail:user.getUseremail()
       }

       const changes={
         $set: {
            "useremail": user.getUseremail(),
            "nickname":user.getUserNickname(),
            "lastLoggedIn":user.getLastLoggedIn(),
            "lastLoggedOut":user.getLastLoggedOut(),
            "friends":user.getFriends()
         }
       }
        try {
            let userDoc=await UserSchema.findOne(filter);
            await UserSchema.updateOne(filter,changes).catch((e:Error)=>{
              console.log(e);
            });
            await userDoc?.save().then((data)=>{
              console.log(data);
            }).catch((e:Error)=>{
              console.log(e);
            });
       }
       catch(e) {
           console.log(e);
       }
   }

   deleteEntryContainer(useremail:String,socketId:string,user:User) {
    this.getLoggedUsers().delete(useremail);
    this.getUsersBySocketId().delete(socketId);
    this.getSocketIdByUser().delete(user);
   }

  async addFriend(newFriend:User,user:User) {
    user.addFriend(newFriend.getUseremail());
    newFriend.addFriend(user.getUseremail());
    try {
      await this.updateUser(user);
      await this.updateUser(newFriend);
      const message={ user1:user,user2:newFriend};
      socketService.getIo().emit(SOCKETEVENT.FMODIFIED,JSON.stringify(message));
    }
    catch(e) {
       console.log(e);
    }
  }

  async removeFriend(friendToRemove:String,useremail:String) {
      let user:User=this.users.find((user)=>user.getUseremail()==useremail) as User;
      user.removeFriend(friendToRemove);
      let friend:User=this.users.find((user)=>user.getUseremail()==friendToRemove) as User;
      friend.removeFriend(useremail);
     
      try {
       await this.updateUser(user);
       await this.updateUser(friend);
       const message={ user1:user,user2:friend};
       socketService.getIo().emit(SOCKETEVENT.FMODIFIED,JSON.stringify(message));
      }
      catch(e) {
          console.log(e);
      }
  }
}

const userService=new UserService();
export default userService;