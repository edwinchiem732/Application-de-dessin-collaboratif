import  mongoose  from 'mongoose';
import AccountSchema from '../Entities/AccountSchema';
import AlbumSchema from '../Entities/AlbumSchema';
import DrawingSchema from '../Entities/DrawingSchema';
import MessageSchema from '../Entities/MessageSchema';
import RoomSchema from '../Entities/RoomSchema';
import UserSchema from '../Entities/UserSchema';
import { AccountInterface } from '../Interface/Account';
import { AlbumInterface } from '../Interface/AlbumInterface';
import { DrawingInterface } from '../Interface/DrawingInterface';
import { MessageInterface } from '../Interface/Message';
import { RoomInterface } from '../Interface/Room';
import { UserInterface } from '../Interface/User';



require('dotenv').config();

let host:string=process.env.MONGO_HOST as string;

class DatabaseService {
    constructor() {
      this.connectToDatabase();
    }

    connectToDatabase() {
        mongoose.connect(host).then(()=>{
            console.log("database connected");
        }).catch((error:Error)=>{
            console.log(error)
        })
    }

    async getAllAccounts() {
        return await AccountSchema.find({}).then((data)=>{
           return data as Array<AccountInterface>;
        })
    }

    async getRoomMessages() {
        return await MessageSchema.find({}).then((data)=>{
            return data as Array<MessageInterface>;
        })
    }

    async getAllUsers() {
        return await UserSchema.find({}).then((data)=>{
            return data as Array<UserInterface>;
        })
    }

    async getAllRooms() {
        return await RoomSchema.find({}).then((data)=>{
            return data as Array<RoomInterface>;
        })
    }

    async getRoom() {
        return await RoomSchema.find({});
    }

    async getAllDrawings() {
        return await DrawingSchema.drawingSchema.find({}).then((data)=>{
            return data as Array<DrawingInterface>;
        })
    }


    async getAllAlbums() {
        return await AlbumSchema.albumSchema.find({}).then((data)=>{
            return data as Array<AlbumInterface>;
        })
    }

}

const databaseService=new DatabaseService();
export default databaseService;