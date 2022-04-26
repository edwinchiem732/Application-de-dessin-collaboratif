import { DrawingInterface } from "./DrawingInterface";

export interface ProtectedDrawingInterface extends DrawingInterface {
    password:String;
}

export function checkProtectedDrawing(object:any):object is ProtectedDrawingInterface {
    return 'password'!==undefined;
}