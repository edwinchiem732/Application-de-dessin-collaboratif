import { BaseShapeInterface } from "./BaseShapeInterface";

export interface DrawingInterface {
    drawingName:String,
    owner:String,
    elements:BaseShapeInterface[],
    roomName:String,
    members:String[],
    visibility:String,
    creationDate:Number;
    likes:String[];
}

