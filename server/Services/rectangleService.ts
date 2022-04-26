import { Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import { Rectangle } from "../class/Rectangle";
import drawingService from "./drawingService";


export class RectangleService {

constructor() { }
 

  startRectangle(socket:Socket) {
    socket.on("STARTRECTANGLE",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTRECTANGLE",JSON.stringify(data));
    })
  }

  drawRectangle(socket:Socket) {
    socket.on("DRAWRECTANGLE",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DRAWRECTANGLE",JSON.stringify(data));
    })
  }

  endRectangle(socket:Socket) {
    socket.on("ENDRECTANGLE",(data)=>{
      data=JSON.parse(data);
      if(drawingService.socketInDrawing.has(socket?.id)) {
        let name:String=drawingService.socketInDrawing.get(socket?.id)?.getName() as String;
        let drawing=drawingService.getDrawingOrProtectedInstance(name);
        let rectangle:Rectangle=new Rectangle(data);
        drawing.elementById.set(rectangle.getId(),rectangle);
        drawing.modified=true;
      }
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("ENDRECTANGLE",JSON.stringify(data));
    })
  }


}

const rectangleService = new RectangleService();
export default rectangleService;