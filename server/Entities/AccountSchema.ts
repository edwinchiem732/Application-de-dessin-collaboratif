import mongoose from 'mongoose';
import {AccountInterface} from '../Interface/Account';


const accountSchema = new mongoose.Schema({
    useremail: {
        type: String,
        required: true,
        unique:true,
    },
    password: {
        type: String,
        required: true,
    },
    nickname: {
        type:String,
        require: true,
        unique:true,
    }

});

export=mongoose.model<AccountInterface>('accountSchema',accountSchema);
