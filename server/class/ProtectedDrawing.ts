import { DrawingInterface } from "../Interface/DrawingInterface";
import { ProtectedDrawingInterface } from "../Interface/ProtectedDrawingInterface";
import { Drawing } from "./Drawing";

export class ProtectedDrawing extends Drawing {
    private password:String;

    constructor(drawing:ProtectedDrawingInterface) {
       
        const base={
            drawingName:drawing.drawingName,
            owner:drawing.owner,
            elements:drawing.elements,
            roomName:drawing.roomName,
            members:drawing.members,
            visibility:drawing.visibility,
            creationDate:drawing.creationDate,
            likes:drawing.likes
        } as DrawingInterface;
        
        super(
          base
        );

        this.password=drawing.password;
    }

    getPassword():String {
        return this.password;
    }

    setPassword(password:String):void {
        this.password=password;
    }
}