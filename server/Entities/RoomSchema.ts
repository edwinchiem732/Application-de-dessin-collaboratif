import mongoose from 'mongoose'
import { RoomInterface } from '../Interface/Room';


const roomSchema = new mongoose.Schema({
   
    roomName: {
        type: String,
        required: true,
        unique:true,
    },
    creator: {
        type: String,
        required: true,
    },
    members:{
        type:[String],
        required:true,
    },
    messages:{
        type:[],
        required:true,
    }
});

export=mongoose.model<RoomInterface>('roomSchema',roomSchema);