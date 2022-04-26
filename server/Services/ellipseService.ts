import { Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import drawingService from "./drawingService";
import { Ellipse } from "../class/Ellipse";


export class EllipseService {

constructor() { }

  startEllipse(socket:Socket) {
    socket.on("STARTELLIPSE",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTELLIPSE",JSON.stringify(data));
    })
  }

  drawEllipse(socket:Socket) {
    socket.on("DRAWELLIPSE",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DRAWELLIPSE",JSON.stringify(data));
    })
  }

  endEllipse(socket:Socket) {
    socket.on("ENDELLIPSE",(data)=>{
      data=JSON.parse(data);
      if(drawingService.socketInDrawing.has(socket?.id)) {
        let name:String=drawingService.socketInDrawing.get(socket?.id)?.getName() as String;
        let drawing=drawingService.getDrawingOrProtectedInstance(name);
        let ellipse:Ellipse=new Ellipse(data);
        drawing.elementById.set(ellipse.getId(),ellipse);
        drawing.modified=true;
      }
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("ENDELLIPSE",JSON.stringify(data));
    })
  }


}

const ellipseService = new EllipseService();
export default ellipseService;