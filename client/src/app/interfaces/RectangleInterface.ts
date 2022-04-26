import { BaseShapeInterface } from "./BaseShapeInterface";

export interface RectangleInterface extends BaseShapeInterface {
    x:number;
    y:number;
    width:number;
    height:number;
    type:string;
    finalX: number;
    finalY: number;
}

export function checkRectangle(object:any):object is RectangleInterface {
    return object.type!=undefined && object.type=='rectangle';
}
