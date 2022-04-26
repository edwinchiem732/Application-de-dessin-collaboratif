import http from 'http';
import { Server } from "socket.io";
import drawingService from './drawingService';
import messageService from "./messageService";


class SocketService {

  private io:Server;

  constructor() { }
      
  init(server:http.Server) {
     this.io=new Server(server);
     messageService.initChat(this.io);
     drawingService.initDrawing(this.io);
     /*rectangleService.initRectangle(this.io);
     ellipseService.initEllipse(this.io);
     pencilService.initPencil(this.io);
     selectionService.initSelection(this.io);
    */
  }

  getIo():Server {
     return this.io;
  }

}

const socketService=new SocketService();
export default socketService;
