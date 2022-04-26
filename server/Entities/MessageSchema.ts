import mongoose from 'mongoose'
import { MessageInterface } from '../Interface/Message';


const messageSchema = new mongoose.Schema({
    time:{
        type:Number,
        requires:true,
        unique:true,
    },
    nickname: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

export=mongoose.model<MessageInterface>('messageSchema',messageSchema);