import { BaseShapeInterface } from "./BaseShapeInterface";

export interface EllipseInterface extends BaseShapeInterface {
    x:number;
    y:number;
    width:number;
    height:number;
    type:string;
    finalX: number;
    finalY: number;
}

export function checkEllipse(object:any):object is EllipseInterface {
   return object.type!=undefined && object.type=='ellipse';
}
