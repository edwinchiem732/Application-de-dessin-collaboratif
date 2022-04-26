import { Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import drawingService from "./drawingService";
import { Line } from "../class/Line";


export class PencilService {

  constructor() { }

  startLine(socket:Socket) {
    socket.on("STARTLINE",(data)=>{
      data=JSON.parse(data);
      console.log(data);
      data.id=uuidv4();
      console.log("line id:"+data.id);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTLINE",JSON.stringify(data));
    })
  }

  drawLine(socket:Socket) {
    socket.on("DRAWLINE",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DRAWLINE",JSON.stringify(data));
    })
  }

  endLine(socket:Socket) {
    socket.on("ENDLINE",(data)=>{
      data=JSON.parse(data);
      // save to one drawing currently have to change when users can be in a specific drawing with socketInDrawing
      console.log("endline");
      console.log(drawingService.socketInDrawing.has(socket?.id));
     try {
       let name:String=drawingService.socketInDrawing.get(socket?.id)?.getName() as String;
       console.log("user in drawing:"+name)
       let drawing=drawingService.getDrawingOrProtectedInstance(name);
       let line:Line=new Line(data);
       drawing.elementById.set(line.getId(),line);
       drawing.modified=true;
      }
      catch(e) {
        console.log(e);
      }
      
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("ENDLINE",JSON.stringify(data));
    })
  }


}

const pencilService=new PencilService();
export default pencilService;
