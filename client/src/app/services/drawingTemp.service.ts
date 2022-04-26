import { Injectable } from "@angular/core";
import { Drawing } from "@app/classes/Drawing";

@Injectable({
    providedIn: 'root',
  })
  export class DrawingTempService {

    drawings:Map<string,Drawing>; //store le name du drawing, drawing
    
    constructor() {
        this.drawings = new Map<string, Drawing>(); 
    }

  }