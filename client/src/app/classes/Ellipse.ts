import { EllipseInterface } from "../interfaces/EllipseInterface";
import { BaseShape } from "./BaseShape";

export class Ellipse extends BaseShape {
    
    private x:Number;
    private y:Number;
    private width:Number;
    private height:Number;

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
