import { RectangleInterface } from "../interfaces/RectangleInterface";
import { BaseShape } from "./BaseShape";

export class Rectangle extends BaseShape {
    
    private x:Number;
    private y:Number;
    private width:Number;
    private height:Number;

    constructor(rectangle:RectangleInterface) {
       super(
         rectangle.id,
         rectangle.user,
         rectangle.strokeWidth,
         rectangle.fill,
         rectangle.stroke,
         rectangle.fillOpacity,
         rectangle.strokeOpacity
       )
       this.x=rectangle.x;
       this.y=rectangle.y;
       this.width=rectangle.width;
       this.height=rectangle.height;
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
}
