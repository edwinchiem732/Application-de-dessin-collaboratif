import { Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import { Ellipse } from "../class/Ellipse";
import { Line } from "../class/Line";
import { Rectangle } from "../class/Rectangle";
import { checkEllipse } from "../Interface/EllipseInterface";
import { checkLine } from "../Interface/LineInterface";
import { checkRectangle } from "../Interface/RectangleInterface";
import drawingService from "./drawingService";


export class SelectionService {

  constructor() { }

  startSelect(socket:Socket) {
    socket.on("STARTSELECT",(data)=>{
      console.log("data here " + data);
      data=JSON.parse(data);
      data.id=uuidv4();
      console.log("user "+socket.id+" starts selecting");
      console.log("STARTSELECT");
      console.log(data+""+drawingService.socketInDrawing.get(socket?.id)?.getName())
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("STARTSELECT",JSON.stringify(data));
    })
  }

  drawSelect(socket:Socket) {
    socket.on("DRAWSELECT",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DRAWSELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  resizeSelect(socket:Socket) {
    socket.on("SIZESELECT",(data)=>{
      data=JSON.parse(data);
      data.id=uuidv4();
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("SIZESELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  deleteSelect(socket:Socket) {
    socket.on("DELETESELECT",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DELETESELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

  endSelect(socket:Socket) {
    socket.on("ENDSELECT",async (data)=>{
      data=JSON.parse(data);
      console.log("endselect");
      if(checkLine(data)) {
        let line:Line=new Line(data);
        let name:String=drawingService.socketInDrawing.get(socket?.id)?.getName() as String;
        let drawing=drawingService.getDrawingOrProtectedInstance(name);
        if(drawing.elementById.has(line.getId())) {
          drawing.elementById.set(line.getId(),line);
          drawing.modified=true;
          await drawingService.autoSaveDrawing(drawing.getName());
        }
      }
      if(checkEllipse(data)) {
        let ellipse:Ellipse=new Ellipse(data);
        let name:String=drawingService.socketInDrawing.get(socket?.id)?.getName() as String;
        let drawing=drawingService.getDrawingOrProtectedInstance(name);
        if(drawing.elementById.has(ellipse.getId())) {
          let oldEllipse=drawing.elementById.get(ellipse.getId());
          ellipse.setX(data.x);
          ellipse.setY(data.y);
          ellipse.setWidth(data.width);
          ellipse.setHeight(data.height);
          ellipse.setFinalX(oldEllipse.finalX);
          ellipse.setFinalY(oldEllipse.finalY);
          drawing.elementById.set(ellipse.getId(),ellipse);
          drawing.modified=true;
          await drawingService.autoSaveDrawing(drawing.getName());

        } 
      }
      if(checkRectangle(data)) {
        let rectangle:Rectangle=new Rectangle(data);
        let name:String=drawingService.socketInDrawing.get(socket?.id)?.getName() as String;
        let drawing=drawingService.getDrawingOrProtectedInstance(name);
        if(drawing.elementById.has(rectangle.getId())) {
          let oldRect=drawing.elementById.get(rectangle.getId());
          rectangle.setX(data.x);
          rectangle.setY(data.y);
          rectangle.setWidth(data.width);
          rectangle.setHeight(data.height);
          rectangle.setFinalX(oldRect.finalX);
          rectangle.setFinalY(oldRect.finalY);
          drawing.elementById.set(rectangle.getId(),rectangle);
          drawing.modified=true;
          await drawingService.autoSaveDrawing(drawing.getName());
        }
      }
      
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("ENDSELECT",JSON.stringify(data));
    })
  }


  downSelect(socket:Socket) {
    socket.on("DOWNSELECT",(data)=>{
      data=JSON.parse(data);
      drawingService.getIo().to(drawingService.socketInDrawing.get(socket?.id)?.getName() as string).emit("DOWNSELECT",JSON.stringify(data));
      //console.log("data x " + data.x);
    })
  }

}

const selectionService=new SelectionService();
export default selectionService;
