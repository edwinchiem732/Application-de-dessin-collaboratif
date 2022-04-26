import mongoose from 'mongoose';

const options = { discriminatorKey: 'kind' };

const albumSchema=new mongoose.Schema({
    albumName: {
        type: String,
        required: true,
        unique:true,
    },
    creator:{
        type: String,
        required: true,
    },
    drawings:{
        type:[String],
        required:true
    },
    visibility:{
        type:String,
        required:true
    },
    dateCreation:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    members:{
        type:[String],
        required:true
    },
    requests:{
        type:[String],
        required:true
    }
},options);

const Album = mongoose.model('albumSchema', albumSchema);

const protectedAlbumSchema=Album.discriminator('protectedAlbumSchema',new mongoose.Schema({password:String},options));

export default module.exports={
  albumSchema:Album,
  protectedAlbumSchema:protectedAlbumSchema
}  
