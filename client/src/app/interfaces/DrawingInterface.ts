import { BaseShapeInterface } from "./BaseShapeInterface";

export interface DrawingInterface {
    drawingName:string,
    owner:string,
    elements:BaseShapeInterface[],
    roomName:string,
    members:string[],
    visibility:string,
    creationDate:number;
    likes:String[]; 
}

