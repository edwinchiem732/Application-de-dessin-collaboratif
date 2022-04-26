import express, { NextFunction, Request, Response } from 'express';
import { Room } from '../class/Room';
import roomService from '../Services/roomService';


const router = express.Router();

const getRoomMessages=(req:Request,res:Response,next:NextFunction)=>{
    const roomName:String=req.params.roomName as String;
    console.log('msg for room '+req.params.roomName);
    if(roomService.getAllRooms().has(roomName)) {
        let room:Room=roomService.getRoomByName(roomName) as Room;
        return res.status(200).json(room.getRoomMessages());
    }
    return res.status(404).json([]);
    
}

router.get('/getRoomMessages/:roomName',getRoomMessages);
export=router;