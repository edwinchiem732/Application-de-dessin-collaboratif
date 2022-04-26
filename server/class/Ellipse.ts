import { EllipseInterface } from "../Interface/EllipseInterface";
import { BaseShape } from "./BaseShape";

export class Ellipse extends BaseShape {
    
    private x:Number;
    private y:Number;
    private width:Number;
    private height:Number;
    private finalX:Number;
    private finalY:Number;

    constructor(ellipse:EllipseInterface) {
       super(
         ellipse.id,
         ellipse.user,
         ellipse.strokeWidth,
         ellipse.fill,
         ellipse.stroke,
         ellipse.fillOpacity,
         ellipse.strokeOpacity
       )
       this.x=ellipse.x;
       this.y=ellipse.y;
       this.width=ellipse.width;
       this.height=ellipse.height;
       this.finalX=ellipse.finalX;
       this.finalY=ellipse.finalY;
    }

    getX():Number {
        return this.x;
    }

    getY():Number {
        return this.y;
    }

    getWidth():Number {
        return this.width;
    }

    getHeight():Number {
        return this.height;
    }

    getFinalX():Number {
        return this.finalX;
    }

    getFinalY():Number {
        return this.finalY;
    }


    setX(x:Number):void {
        this.x=x;
    }

    setY(y:Number):void {
        this.y=y
    }

    setWidth(width:Number):void {
        this.width=width;
    }

    setHeight(height:Number):void {
        this.height=height;
    }

    setFinalX(finalX:Number):void {
        this.finalX=finalX;
    }

    setFinalY(finalY:Number):void {
        this.finalY=finalY;
    }
}
