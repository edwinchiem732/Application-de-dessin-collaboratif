import { BaseShapeInterface } from "../Interface/BaseShapeInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import { checkEllipse, EllipseInterface } from "../Interface/EllipseInterface";
import { checkLine, LineInterface } from "../Interface/LineInterface";
import { checkRectangle, RectangleInterface } from "../Interface/RectangleInterface";
import drawingService from "../Services/drawingService";
import userService from "../Services/userService";
import { BaseShape } from "./BaseShape";
import { Ellipse } from "./Ellipse";
import { Line } from "./Line";
import { Rectangle } from "./Rectangle";
import { User } from "./User";


export class Drawing {
    private drawingName:String;
    private owner:String;
    public elements:BaseShape[]=[];  // shapeId and Shape
    public roomName:String;
    public members:String[];
    public modified:boolean=false;
    private visibility:String;
    private creationDate:Number;
    private likes:String[] = [];
 

    elementById:Map<String,BaseShape>;
    membersBySocketId:Map<string,String>;  // socketId and useremail


    constructor(drawing:DrawingInterface) {
       this.drawingName=drawing.drawingName;
       this.owner=drawing.owner;
       this.roomName=drawing.roomName;
       this.members=drawing.members;
       this.elementById=new Map<String,BaseShape>();
       this.membersBySocketId=new Map<string,String>();
       this.visibility=drawing.visibility;
       this.creationDate=drawing.creationDate;
       this.likes=drawing.likes;


       drawing.elements.forEach((element:BaseShapeInterface)=>{
           if(checkLine(element)) {
               let line:Line=new Line(element);
               this.elementById.set(line.getId(),line);
           }
           if(checkEllipse(element)) {
               let ellipse:Ellipse=new Ellipse(element);
               this.elementById.set(ellipse.getId(),ellipse);
           }
           if(checkRectangle(element)) {
               let rectangle:Rectangle=new Rectangle(element);
               this.elementById.set(rectangle.getId(),rectangle);
           }
       });
       this.autoSave();
    }

    getName():String {
        return this.drawingName;
    }

    getOwner():String {
        return this.owner;
    }

    getElements():BaseShape[] {
        this.elements=[];
        this.elementById.forEach((v,k)=>{
            this.elements.push(v);
        });
        return this.elements;
    }

    getElementsInterface():BaseShapeInterface[] {
       let interfaceInstances:BaseShapeInterface[]=[];
       this.getElements().forEach((element)=>{
           if(element instanceof Line) {
             let elementInterface:LineInterface={  
               id:element.getId(),
               user:element.getUser(),
               strokeWidth:element.getStrokeWidth(),
               fill:element.getFill(),
               stroke:element.getStroke(),
               fillOpacity:element.getFillOpacity(),
               strokeOpacity:element.getStrokeOpacity(),
               pointsList:element.getPoints()
             } as LineInterface;
             interfaceInstances.push(elementInterface);
           }
           if(element instanceof Ellipse) {
              let elementInterface:EllipseInterface={
                id:element.getId(),
                user:element.getUser(),
                strokeWidth:element.getStrokeWidth(),
                fill:element.getFill(),
                stroke:element.getStroke(),
                fillOpacity:element.getFillOpacity(),
                strokeOpacity:element.getStrokeOpacity(),
                x:element.getX(),
                y:element.getY(),
                width:element.getWidth(),
                height:element.getHeight(),
                type:"ellipse",
                finalX:element.getFinalX(),
                finalY:element.getFinalY()
              } as EllipseInterface;
              interfaceInstances.push(elementInterface);
           }
           if(element instanceof Rectangle) {
            let elementInterface:RectangleInterface={
              id:element.getId(),
              user:element.getUser(),
              strokeWidth:element.getStrokeWidth(),
              fill:element.getFill(),
              stroke:element.getStroke(),
              fillOpacity:element.getFillOpacity(),
              strokeOpacity:element.getStrokeOpacity(),
              x:element.getX(),
              y:element.getY(),
              width:element.getWidth(),
              height:element.getHeight(),
              type:"rectangle",
              finalX:element.getFinalX(),
              finalY:element.getFinalY()
            } as RectangleInterface;
            interfaceInstances.push(elementInterface);
         }
       });
       
       return interfaceInstances;
    }

    getMembers():String[] {
        this.members=[];
        this.membersBySocketId.forEach((v,k)=>{
            this.members.push(v);
        })
        return this.members;
    }

    getVisibility():String {
        return this.visibility;
    }

    getCreationDate():Number {
        return this.creationDate;
    }

    getLikes():String[] {
        return this.likes;
    }

    getNbLikes():Number {
        return this.likes.length as Number;
    }

    setName(name:String):void {
        this.drawingName=name;
    }

    setOwner(owner:String) {
        this.owner=owner;
    }

    setElements(elements:BaseShape[]) {
        this.elementById.clear();
        elements.forEach((element)=>{
            this.elementById.set(element.getId(),element);
        })
    }

    setMembers(members:String[]) {
        this.membersBySocketId.clear();
        members.forEach((member)=>{
            let user:User=userService.getUserByUseremail(member) as User;
            let socketId:string=userService.getSocketIdByUser().get(user) as string;
            this.membersBySocketId.set(socketId,member);
        })
    }

    setVisibility(visibility:String) {
        this.visibility=visibility;
    }

    setCreationDate(date:number) {
        this.creationDate=date;
    }

    setNbLikes(users:String[]):void {
        this.likes=users;
    }


    removeMember(socketId:string):void {
        this.membersBySocketId.delete(socketId);
    }

    addMember(socketId:string,email:String) {
        this.membersBySocketId.set(socketId,email);
    }

    addLikes(mail:String) {
      this.likes.push(mail);
    }

    removeLikes(mail:String) {
        const index = this.likes.indexOf(mail);
        if (index > -1) {
            this.likes.splice(index, 1); 
        }
    }

    
    async autoSave() {
        await drawingService.autoSaveDrawing(this.drawingName);
        setTimeout(() => {
            this.autoSave();
       }, 1000)
    }

    removeElement(shapeId:String) {
        this.elementById.forEach((v,k)=>{
            if(k==shapeId) {
                this.elementById.delete(k);
            }
        })
    }


}
