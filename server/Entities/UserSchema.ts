import mongoose from 'mongoose';
import {UserInterface} from '../Interface/User';


const userSchema = new mongoose.Schema({
    useremail: {
        type: String,
        required: true,
        unique:true,
    },
    nickname: {
        type:String,
        require: true,
    },
    lastLoggedIn:{
        type:Number
    },
    lastLoggedOut:{
        type:Number
    },
    avatar:{
        type:String,
        required:true
    },
    friends:{
        type:[String],
        required:true
    }
});

export=mongoose.model<UserInterface>('userSchema',userSchema);