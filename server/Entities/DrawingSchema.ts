import mongoose from 'mongoose';

const options = { discriminatorKey: 'kind' };

const drawingSchema = new mongoose.Schema({
    
    drawingName: {
        type:String,
        required: true,
        unique:true,
    },
    owner: {
        type:String,
        require: true,
    },
    elements: {
        type:[],
        required:true,
    },
    roomName:{
        type:String,
        required:true,
    },
    members:{
        type:[String],
        required:true,
    },
    visibility:{
        type:String,
        required:true
    },
    creationDate:{
        type:Number,
        required:true
    },
    likes:{
        type:[String],
        required:true
    }
    
},options);

const Drawing = mongoose.model('drawingSchema', drawingSchema);

const protectedDrawingSchema=Drawing.discriminator('protectedDrawingSchema',new mongoose.Schema({password:String},options));

export default module.exports={
  drawingSchema:Drawing,
  protectedDrawingSchema:protectedDrawingSchema
}  
