import { LineInterface } from "../interfaces/LineInterface";
import { Point } from "@app/interfaces/Point";
import { BaseShape } from "./BaseShape";

export class Line extends BaseShape {

    pointsList:Point[];

    constructor(line:LineInterface) 
    {
       super(
           line.id,
           line.user,
           line.strokeWidth,
           line.fill,
           line.stroke,
           line.fillOpacity,
           line.strokeOpacity
       )
       this.pointsList=line.pointsList;
    }
    
    getPoints():Point[] {
        return this.pointsList;
    }

}
