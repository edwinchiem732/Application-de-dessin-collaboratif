import { BaseShapeInterface } from "./BaseShapeInterface";

export interface EllipseInterface extends BaseShapeInterface {
    x:Number;
    y:Number;
    width:Number;
    height:Number;
    type:String;
    finalX:Number;
    finalY:Number;
}

export function checkEllipse(object:any):object is EllipseInterface {
   return object.type!=undefined && object.type=='ellipse';
}
