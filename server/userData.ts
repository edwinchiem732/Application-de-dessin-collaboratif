import express, { NextFunction, Request, Response } from 'express';
import messageSchema from './Entities/MessageSchema'
import roomService from './Services/roomService';

const router = express.Router();

const userData=(req: Request, res: Response, next: NextFunction)=>{
  
    console.log('userData received');
    roomService.getAllRooms().forEach((v,k)=>{
        console.log(v.getUsersInRoom()[0]);
    });
    return res.json({
        name:"user 1",
        size:5
    })
}

const print=(req:Request,res:Response,next:NextFunction)=>{
    console.log(req.body);
    let user=req.body.user;
    let msg=req.body.msg;

    const message=new messageSchema({sender:user,content:msg})
    message.save();

    console.log("request received")
    return res.json(
    {data:"MSG GET RECEIVED"}
    )
}

router.get('/userData',userData)
router.post('/userData/msg',print)

export=router;