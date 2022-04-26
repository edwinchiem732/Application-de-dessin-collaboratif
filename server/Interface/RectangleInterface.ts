import { BaseShapeInterface } from "./BaseShapeInterface";

export interface RectangleInterface extends BaseShapeInterface {
    x:Number;
    y:Number;
    width:Number;
    height:Number;
    type:String;
    finalX:Number;
    finalY:Number;
}

export function checkRectangle(object:any):object is RectangleInterface {
    return object.type!=undefined && object.type=='rectangle';
}
