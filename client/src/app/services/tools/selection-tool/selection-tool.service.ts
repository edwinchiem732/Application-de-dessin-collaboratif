import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { KeyCodes } from '../../hotkeys/hotkeys-constants';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { SelectionCommandConstants } from './command-type-constant';
import { SelectionTransformService } from './selection-transform.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ToolRectangleService } from '../tool-rectangle/tool-rectangle.service';
import { ToolEllipseService } from '../tool-ellipse/tool-ellipse.service';
import { PencilToolService } from '../pencil-tool/pencil-tool.service';
//import { FilledShape } from '../tool-rectangle/filed-shape.model';
import { Pencil } from '../pencil-tool/pencil.model';
import { EllipseInterface } from '@app/interfaces/EllipseInterface';
import { RectangleInterface } from '@app/interfaces/RectangleInterface';


@Injectable({
  providedIn: 'root',
})
export class SelectionToolService implements Tools {

  readonly id: number = ToolIdConstants.SELECTION_ID;
  readonly faIcon: IconDefinition = faMousePointer;
  readonly toolName = 'Sélection';
  parameters: FormGroup;

  private hasSelectedItems = false;
  private isAlt = false;
  private isShift = false;

  private pointsSideLength = 10;
  private pointsList: Point[] = [
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ];
  private ctrlPoints: SVGRectElement[] = [];
  private controlPoints: Map<string, SVGGraphicsElement> =  new Map<string, SVGGraphicsElement>();
  private ctrlG: SVGGElement;
  private object: SVGElement;
  private rectSelection: SVGPolygonElement;

  private rectInversement: SVGRectElement;
  private firstInvObj: SVGElement | null;
  private recStrokeWidth = 1;

  private objects: SVGElement[] = [];
  private tmpX: number;
  private tmpY: number;
  private wasMoved = false;
  private isIn = false;

  private movTranslateX: number = 0;
  private movTranslateY: number = 0;
  private movResizeX: number = 0;
  private movResizeY: number = 0;

  public dom = false;
  private identif: string;

  private rectangleAttributes: RectangleInterface = {
    id: "",
    user: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    type: "rectangle",
    finalX: 0,
    finalY: 0,
    strokeWidth: 0,
    fill: 'none',
    stroke: 'none',
    fillOpacity: 'none',
    strokeOpacity: 'none',
  };
  private ellipseAttributes: EllipseInterface = {
    id: "",
    user: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    type: "ellipse",
    finalX: 0,
    finalY: 0,
    strokeWidth: 0,
    fill: 'none',
    stroke: 'none',
    fillOpacity: 'none',
    strokeOpacity: 'none',
  };
  private pencil: Pencil | null = {
    id: "",
    user: "",
    pointsList:[],
    strokeWidth: 0,
    fill: 'none',
    stroke: 'none',
    fillOpacity: 'none',
    strokeOpacity: 'none',
  }

  renderer: Renderer2

  constructor(
    rendererFactory: RendererFactory2,
    private drawingService: DrawingService,
    private offsetManager: OffsetManagerService,
    private rendererService: RendererProviderService,
    private selectionTransformService: SelectionTransformService,
    private socketService: SocketService,
    private rectangleService: ToolRectangleService,
    private ellipseService: ToolEllipseService,
    private pencilService: PencilToolService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.setRectInversement();
    this.setRectSelection();
    this.setCtrlPoints();
  }

  setUpSelection() {
    this.socketService.getSocket().on("STARTSELECT", (data)=>{
      console.log("START SELECT");
      data=JSON.parse(data);

      this.tmpX = data.off.x;
      this.tmpY = data.off.y;
      console.log(this.tmpX);
      console.log(this.tmpY);
      const obj = this.drawingService.getObject((data.identif));

      this.identif = data.identif;

      this.object = obj!;
      console.log(this.object);

      console.log("oof x", data.off.x);
      console.log("oof y", data.off.y);

      if (this.isInside(data.off.x, data.off.y)) {
        console.log("true 1");
        this.isIn = true;
        if (!this.selectionTransformService.hasCommand()) {
          this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
        }
      }
      else {
        let counter = 0;
        let newid = "";
        this.ctrlPoints.forEach((point) => {
          newid = data.identif + `${counter++}`;
          this.rendererService.renderer.setAttribute(point, 'id', newid as string);
          this.controlPoints.set(newid, point);
          this.rendererService.renderer.setAttribute(point, 'x', data.off.x.toString() + 'px');
          this.rendererService.renderer.setAttribute(point, 'y', data.off.y.toString() + 'px');
        });
        this.removeSelection();

        if (obj && (this.objects.length < 2 || !this.objects.includes(obj))) {
          this.objects.push(obj!);
          this.setSelection();
          console.log("true 2");
          this.isIn = true;

          this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
          this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
          this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
          return;
        }
      }

      this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.removeInversement();
      this.selectionTransformService.endCommand();
      console.log("true ?", data.inside);
      this.isIn = data.inside;

      const allObject: SVGElement[] = [];
      this.drawingService.getObjectList().forEach((value) => {
        if (value.tagName.toLowerCase() !== 'defs') {
          allObject.push(value);
        }
      });
    });

    this.socketService.getSocket().on("DRAWSELECT", (data)=>{
      data=JSON.parse(data);
      console.log("DRAW SELECT");

      this.wasMoved = true;
      console.log("mouse x", data.x);
      console.log("mouse y", data.y);
      if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
        this.selectionTransformService.resize(data.x, data.y, data.off);
        this.movResizeX = this.movResizeX + data.x;
        this.movResizeY = this.movResizeY + data.y;
        this.setSelection();
        return;
      }
      if (this.isIn) {
        console.log("translaye", this.isIn);
        if (this.selectionTransformService.getCommandType() !== SelectionCommandConstants.TRANSLATE) {
          this.selectionTransformService.createCommand(SelectionCommandConstants.TRANSLATE, this.rectSelection, this.objects);
        }
        this.selectionTransformService.translate(data.x, data.y);
        this.movTranslateX = this.movTranslateX + data.x;
        this.movTranslateY = this.movTranslateY + data.y;
        this.setSelection();
      }
      else {
        //this.setSizeOfSelectionArea(data.x, data.y, this.rectSelection);
      }
    });

    this.socketService.getSocket().on("SIZESELECT", (data)=>{
      data=JSON.parse(data);
      console.log("SIZE SELECT");

      const obj = this.controlPoints.get(data.identif);
      this.selectionTransformService.createCommand(SelectionCommandConstants.RESIZE, this.rectSelection, this.objects, data.off, obj as SVGRectElement,);
      this.isIn = false;
    });

    /*this.socketService.getSocket().on("DELETESELECT", (data)=>{
      data=JSON.parse(data);

      if (data.bool == true) {
        //this.drawingService.removeObject((this.object));
      }
      this.dom = false;
      this.objects = [];
      this.hasSelectedItems = false;
  
      this.rendererService.renderer.removeChild(this.drawingService.drawing, this.objects);
      this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.removeChild(this.drawingService.drawing, this.ctrlG);
      this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
    });*/

    this.socketService.getSocket().on("DELETESHAPE",(data)=>{
      data=JSON.parse(data);

      if (data.bool == true) {
        this.drawingService.removeObject(this.identif);
      }
      this.dom = false;
      this.objects = [];
      this.hasSelectedItems = false;
  
      this.rendererService.renderer.removeChild(this.drawingService.drawing, this.objects);
      this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.removeChild(this.drawingService.drawing, this.ctrlG);
      this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');

      this.playAudio("bin.wav");
    });

    this.socketService.getSocket().on("ENDSELECT", (data)=>{
      data=JSON.parse(data);

      console.log("END SELECT", data);
      //console.log("pencil", this.pencil);
      //console.log("ellipse", this.ellipseAttributes);
      //console.log("rectangle", this.rectangleAttributes);
    });
  }

  reinit() {
    this.objects = [];
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.objects);
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectSelection);
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.ctrlG);
    this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
  }

  playAudio(title: string) {
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  /// Quand le bouton gauche de la sourie est enfoncé, soit on selectionne un objet, soit on debute une zone de selection
  /// soit on s'aprete a deplacer un ou plusieurs objet ou soit on enleve une selection.
  /// Avec le bouton droit, on debute une zone d'inversion.
  onPressed(event: MouseEvent): void {
    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      let target = event.target as SVGElement;
      console.log("ON PRESSED");
      this.socketService.getSocket().emit("DOWNSELECT", JSON.stringify({ off: offset, identif: target.id, inside: true }));

      if (this.ctrlPoints.includes(target as SVGRectElement)) {
        this.socketService.getSocket().emit("SIZESELECT", JSON.stringify({ off: offset, identif: target.id }));
        return;
      }

      if (target.getAttribute('name') === 'pen') {
        target = target.parentNode as SVGElement;
      }

      const obj = this.drawingService.getObject((target.id));

      if (event.button === LEFT_CLICK) {
        if (this.isInside(offset.x, offset.y)) {
          console.log("true pressed");
          this.isIn = true;
          if (!this.selectionTransformService.hasCommand()) {
            this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
            console.log("the real deal");
            this.socketService.getSocket().emit("STARTSELECT", JSON.stringify({ off: offset, identif: target.id, inside: true }));
          }
        }
        else {
          console.log("the real deal 2");
            this.socketService.getSocket().emit("STARTSELECT", JSON.stringify({ off: offset, identif: target.id, inside: false }));
        }
      } 
      else {
        if (obj) {
          this.firstInvObj = obj;
        }
        this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectInversement);
        this.wasMoved = true;
      }

      if (this.hasSelectedItems) {
        return;
      }
    }
  }

  /// Quand le bouton de la sourie gauche est relache, soit on selectionne un objet, soit on termine une zone de selection
  /// et on recherche les objets a l'interieur. Avec le droit, on termine la zone d'inversement et on inverse
  /// la selection des objets se situant a l'interieur.
  onRelease(event: MouseEvent): ICommand | void {
    const obj = this.drawingService.getObject((this.identif));
    
    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      if (event.button === LEFT_CLICK) {
        if (this.wasMoved && !this.hasSelectedItems) {
          console.log("end1");
          //this.findObjects(this.rectSelection, event.button);
        }
        else if (!this.wasMoved && this.objects.length >= 1 && this.isIn) {
          console.log("end2");
          this.objects = [];
          const target = event.target as SVGElement;
          const obj = this.drawingService.getObject((target.id));
          
          if (obj) {
            console.log("end3");
            this.objects.push(obj);
            this.selectionTransformService.createCommand(SelectionCommandConstants.TRANSLATE, this.rectSelection, this.objects);
          }
        }
      } 
      else {
        console.log("end4");
        this.findObjects(this.rectInversement, event.button);
      }
      if (this.objects.length > 0) {
        //this.setSelection();
      } 
      else {
        //this.removeSelection();
      }

      let returnRectangleCommand;
      if (this.wasMoved) {
        if (this.selectionTransformService.hasCommand()) {
          console.log("end5");
          returnRectangleCommand = this.selectionTransformService.getCommand();
          this.selectionTransformService.endCommand();
          
          this.pencilService.objects.forEach((SVGGraphicsElement, string) =>{
            if (string ==  this.identif) {
              this.pencil = {
                id:  this.identif,
                user: this.pencilService.pencil?.user!,
                pointsList: this.pencilService.shapes.get(this.identif)!.pointsList,
                strokeWidth: +obj?.getAttribute('stroke-width')?.slice(0, -2)!,
                fill: this.pencilService.shapes.get(this.identif)!.fill,
                stroke: this.pencilService.shapes.get(this.identif)!.stroke,
                fillOpacity: this.pencilService.shapes.get(this.identif)!.fillOpacity,
                strokeOpacity: this.pencilService.shapes.get(this.identif)!.strokeOpacity,
              }
              console.log("pencil", this.pencil);
            }
          });

          this.rectangleService.objects.forEach((SVGGraphicsElement, string) =>{
            if (string == this.identif) {
              //this.rectangleAttributes.x = +obj?.getAttribute('x')?.slice(0, -2)!;
              this.rectangleAttributes = {
                id: this.identif,
                user: this.rectangleService.rectangleAttributes.user,
                x: Math.round(+obj?.getAttribute('x')?.slice(0, -2)! + this.movTranslateX) as number,
                y: Math.round(+obj?.getAttribute('y')?.slice(0, -2)! + this.movTranslateY) as number,
                width: Math.round(Math.abs(+obj?.getAttribute('width')?.slice(0, -2)! + this.movResizeX)) as number,
                height: Math.round(Math.abs(+obj?.getAttribute('height')?.slice(0, -2)! + this.movResizeY)) as number,
                type: "rectangle",
                finalX: this.rectangleService.shapes.get(this.identif)!.finalX,
                finalY: this.rectangleService.shapes.get(this.identif)!.finalY,
                strokeWidth: +obj?.getAttribute('stroke-width')?.slice(0, -2)!,
                fill: this.rectangleService.shapes.get(this.identif)!.fill,
                stroke: this.rectangleService.shapes.get(this.identif)!.stroke,
                fillOpacity: this.rectangleService.shapes.get(this.identif)!.fillOpacity,
                strokeOpacity: this.rectangleService.shapes.get(this.identif)!.strokeOpacity
              }
              this.socketService.getSocket().emit("ENDSELECT", JSON.stringify(this.rectangleAttributes));
              console.log("rectangle", this.rectangleAttributes);
            }
          });

          this.ellipseService.objects.forEach((SVGGraphicsElement, string) =>{
            if (string == this.identif) {
              this.ellipseAttributes = {
                id: this.identif,
                user: this.ellipseService.ellipseAttributes.user,
                x: Math.round((+obj?.getAttribute('cx')?.slice(0, -2)! - +obj?.getAttribute('width')?.slice(0, -2)!/2 + this.movResizeX) + this.movTranslateX) as number,
                y: Math.round((+obj?.getAttribute('cy')?.slice(0, -2)! - +obj?.getAttribute('height')?.slice(0, -2)!/2 + this.movResizeY) + this.movTranslateY) as number,
                width: Math.round(+obj?.getAttribute('width')?.slice(0, -2)! + this.movResizeX) as number,
                height: Math.round(+obj?.getAttribute('height')?.slice(0, -2)! + this.movResizeY) as number,
                type: "ellipse",
                finalX: this.ellipseService.shapes.get(this.identif)!.finalX,
                finalY: this.ellipseService.shapes.get(this.identif)!.finalY,
                strokeWidth: this.ellipseService.shapes.get(this.identif)!.strokeWidth,
                fill: this.ellipseService.shapes.get(this.identif)!.fill,
                stroke: this.ellipseService.shapes.get(this.identif)!.stroke,
                fillOpacity: this.ellipseService.shapes.get(this.identif)!.fillOpacity,
                strokeOpacity: this.ellipseService.shapes.get(this.identif)!.strokeOpacity
              }
              this.socketService.getSocket().emit("ENDSELECT", JSON.stringify(this.ellipseAttributes));
              console.log("ellipse", this.ellipseAttributes);
            }
          });

          this.movResizeX = 0;
          this.movResizeY = 0;
          this.movTranslateX = 0;
          this.movTranslateY = 0;
        }
        this.wasMoved = false;
        console.log("end6");
        return returnRectangleCommand;
      }
    }
  }

  /// Quand le bouton de la sourie gauche est enfonce et que le bouge la sourie, soit on selectionne un objet,
  /// soit on modifie la dimension du rectangle de selection, soit on deplace un ou plusieurs objets.
  /// Avec le droit, on modifie la dimension du rectangle d'inversement.
  onMove(event: MouseEvent): void {
    const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    //this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: event.movementX, y: event.movementY, off: offset, inside: false }));
    if (this.drawingService.drawing) {
      if (event.buttons === 1) {
        this.wasMoved = true;
        this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: event.movementX, y: event.movementY, off: offset, inside: false }));
        if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
          console.log("hm")
          this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: event.movementX, y: event.movementY, off: offset, inside: false }));
          return;
        }

        if (this.isIn) {
          console.log("gim");
          if (this.selectionTransformService.getCommandType() !== SelectionCommandConstants.TRANSLATE) {
            //this.selectionTransformService.createCommand(SelectionCommandConstants.TRANSLATE, this.rectSelection, this.objects);
          }
          this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: event.movementX, y: event.movementY, off: offset, inside: true }));
        } 
        else {
          this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
          //this.isIn = false;
          //this.socketService.getSocket().emit("DRAWSELECT", JSON.stringify({ x: offset.x, y: offset.y, off: offset, inside: false }));
        }
      } 
      else if (event.buttons === 2) {
        //this.setSizeOfSelectionArea(offset.x, offset.y, this.rectInversement);
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isAlt) {
      this.isAlt = event.code === KeyCodes.altR || event.code === KeyCodes.altL;
    }
    if (!this.isShift) {
      this.isShift = event.code === KeyCodes.shiftR || event.code === KeyCodes.shiftL;
    }

    this.wasMoved = true;

    if (this.isAlt) {
      this.selectionTransformService.setAlt(true);
    }
    if (this.isShift) {
      this.selectionTransformService.setShift(true);
      this.setSelection();
    }

    if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
      this.selectionTransformService.resizeWithLastOffset();
      this.setSelection();
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (this.isAlt) {
      this.isAlt = !(event.code === KeyCodes.altR || event.code === KeyCodes.altL);
    }
    if (this.isShift) {
      this.isShift = !(event.code === KeyCodes.shiftR || event.code === KeyCodes.shiftL);
    }

    this.wasMoved = true;

    if (!this.isAlt) {
      this.selectionTransformService.setAlt(false);
    }
    if (!this.isShift) {
      this.selectionTransformService.setShift(false);
      this.setSelection();
    }

    if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
      this.selectionTransformService.resizeWithLastOffset();
      this.setSelection();
    }

  }

  /// Methode qui applique un redimensionnement au rectangle de selection ou d'inversement.
  /*private setSizeOfSelectionArea(x: number, y: number, rectUsing: SVGElement): void {
    let recX = this.tmpX + this.recStrokeWidth / 2;
    let recY = this.tmpY + this.recStrokeWidth / 2;
    let width = x - this.tmpX - this.recStrokeWidth;
    let height = y - this.tmpY - this.recStrokeWidth;

    if (width < 0) {
      recX = x + this.recStrokeWidth / 2;
      width = Math.abs(width) - 2 * this.recStrokeWidth;
    }
    if (height < 0) {
      recY = y + this.recStrokeWidth / 2;
      height = Math.abs(height) - 2 * this.recStrokeWidth;
    }

    if (width < 0) {
      width = 0;
    }
    if (height < 0) {
      height = 0;
    }

    if (rectUsing === this.rectInversement) {
      this.rendererService.renderer.setAttribute(rectUsing, 'x', `${recX}`);
      this.rendererService.renderer.setAttribute(rectUsing, 'y', `${recY}`);
      this.rendererService.renderer.setAttribute(rectUsing, 'height', `${height}`);
      this.rendererService.renderer.setAttribute(rectUsing, 'width', `${width}`);
    } 
    else {
      this.pointsList[0].x = recX; this.pointsList[0].y = recY;
      this.pointsList[1].x = recX + width / 2; this.pointsList[1].y = recY;
      this.pointsList[2].x = recX + width; this.pointsList[2].y = recY;
      this.pointsList[3].x = recX + width; this.pointsList[3].y = recY + height / 2;
      this.pointsList[4].x = recX + width; this.pointsList[4].y = recY + height;
      this.pointsList[5].x = recX + width / 2; this.pointsList[5].y = recY + height;
      this.pointsList[6].x = recX; this.pointsList[6].y = recY + height;
      this.pointsList[7].x = recX; this.pointsList[7].y = recY + height / 2;
      this.rendererService.renderer.setAttribute(rectUsing, 'points', this.pointsToString());
      for (let i = 0; i < 8; i++) {
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'x', `${this.pointsList[i].x + 0.5 - this.pointsSideLength / 2}`);
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'y', `${this.pointsList[i].y + 0.5 - this.pointsSideLength / 2}`);
      }
    }
  }*/

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

  /// Methode qui trouve les objets se situant a l'interieur du rectangle de selection ou d'inversement trace.
  private findObjects(rectUsing: SVGElement, button: number): void {
    const allObject: SVGElement[] = [];
    this.drawingService.getObjectList().forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        allObject.push(value);
      }
    });

    const rectBox = rectUsing.getBoundingClientRect();

    if (button === 0) {
      allObject.forEach((obj) => {
        const box = obj.getBoundingClientRect();
        if (!(rectBox.left > box.right + this.strToNum(obj.style.strokeWidth) / 2
          || rectBox.right < box.left - this.strToNum(obj.style.strokeWidth) / 2
          || rectBox.top > box.bottom + this.strToNum(obj.style.strokeWidth) / 2
          || rectBox.bottom < box.top - this.strToNum(obj.style.strokeWidth) / 2)) {
          this.objects.push(obj);
        }
      });
    } 
    else {
      allObject.forEach((obj) => {
        const box = obj.getBoundingClientRect();
        if (!(rectBox.left > box.right || rectBox.right < box.left || rectBox.top > box.bottom || rectBox.bottom < box.top)) {
          if (obj && obj !== this.firstInvObj) {
            if (this.objects.includes(obj)) {
              this.objects.splice(this.objects.indexOf(obj, 0), 1);
            } 
            else {
              this.objects.push(obj);
            }
          }
        }
      });
      if (this.firstInvObj) {
        if (this.objects.includes(this.firstInvObj)) {
          this.objects.splice(this.objects.indexOf(this.firstInvObj, 0), 1);
        } 
        else {
          this.objects.push(this.firstInvObj);
        }
      }
    }
  }

  /// Methode qui calcule la surface que le rectangle de selection doit prendre en fonction des objets selectionnes.
  private setSelection(): void {
    if (this.hasSelection()) {
      this.hasSelectedItems = true;
      this.rendererService.renderer.setAttribute(this.rectSelection, 'transform', ``);
      this.ctrlPoints.forEach((point) => {
        this.rendererService.renderer.setAttribute(point, 'transform', '');
      });

      let boundingRect = this.objects[0].getBoundingClientRect();

      let x = 0;
      let y = 0;
      let width = 0;
      let height = 0;

      let objStrokeWidth = 0;
      if (this.objects[0].style.stroke !== 'none') {
        objStrokeWidth = this.strToNum(this.objects[0].style.strokeWidth);
      }
      let markerID: string | null = this.objects[0].getAttribute('marker-start');
      if (markerID) {
        objStrokeWidth = Number(markerID.substring(5, markerID.indexOf('-')));
      }

      if (this.objects.length === 1 || !this.wasMoved) {
        x = boundingRect.left - this.xFactor() - objStrokeWidth / 2;
        y = boundingRect.top - objStrokeWidth / 2;
        width = boundingRect.width + objStrokeWidth;
        height = boundingRect.height + objStrokeWidth;
      } 
      else {
        let xL = boundingRect.left - objStrokeWidth / 2;
        let xR = boundingRect.right + objStrokeWidth / 2;

        let yT = boundingRect.top - objStrokeWidth / 2;
        let yB = boundingRect.bottom + objStrokeWidth / 2;

        this.objects.forEach((elm) => {
          let value;
          boundingRect = elm.getBoundingClientRect();

          objStrokeWidth = 0;
          if (elm.style.stroke !== 'none') {
            objStrokeWidth = this.strToNum(elm.style.strokeWidth);
          }
          markerID = elm.getAttribute('marker-start');
          if (markerID) {
            objStrokeWidth = Number(markerID.substring(5, markerID.indexOf('-')));
          }

          value = boundingRect.left - objStrokeWidth / 2;
          if (value < xL) {
            xL = value;
          }

          value = boundingRect.right + objStrokeWidth / 2;
          if (value > xR) {
            xR = value;
          }

          value = boundingRect.top - objStrokeWidth / 2;
          if (value < yT) {
            yT = value;
          }

          value = boundingRect.bottom + objStrokeWidth / 2;
          if (value > yB) {
            yB = value;
          }
        });

        x = xL - this.xFactor();
        y = yT;
        width = xR - xL;
        height = yB - yT;
      }

      this.pointsList[0].x = x; this.pointsList[0].y = y;
      this.pointsList[1].x = x + width / 2; this.pointsList[1].y = y;
      this.pointsList[2].x = x + width; this.pointsList[2].y = y;
      this.pointsList[3].x = x + width; this.pointsList[3].y = y + height / 2;
      this.pointsList[4].x = x + width; this.pointsList[4].y = y + height;
      this.pointsList[5].x = x + width / 2; this.pointsList[5].y = y + height;
      this.pointsList[6].x = x; this.pointsList[6].y = y + height;
      this.pointsList[7].x = x; this.pointsList[7].y = y + height / 2;

      this.rendererService.renderer.setAttribute(this.rectSelection, 'points', this.pointsToString());
      for (let i = 0; i < 8; i++) {
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'x', `${this.pointsList[i].x + 0.5 - this.pointsSideLength / 2}`);
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'y', `${this.pointsList[i].y + 0.5 - this.pointsSideLength / 2}`);
      }
    }
  }

  /// Methode qui suprime la selection courante .
  removeSelection(): void {
    this.objects = [];
    this.hasSelectedItems = false;

    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.objects);
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectSelection);
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.ctrlG);
    this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
  }

  removeSelectionCollab(): void {
    //this.socketService.getSocket().emit("DELETESELECT", JSON.stringify({ bool: this.dom }));

    this.socketService.getSocket().emit("DELETESHAPE", JSON.stringify({ id: this.identif, bool: this.dom }));
  }

  /// Methode pour cacher la selection en gardant en memoire les element
  hideSelection(): void {
    this.rendererService.renderer.setAttribute(this.ctrlG, 'visibility', 'hidden');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'visibility', 'hidden');
  }
  // Rendre la selection visible
  showSelection(): void {
    this.rendererService.renderer.setAttribute(this.ctrlG, 'visibility', 'visible');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'visibility', 'visible');

  }

  /// Methode qui suprime le rectangle de selection du dessin.
  private removeInversement(): void {
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectInversement);

    this.rendererService.renderer.setAttribute(this.rectInversement, 'x', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'y', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'width', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'height', '0');
  }

  /// Initialise le rectangle de selection.
  private setRectSelection(): void {
    this.rectSelection = this.rendererService.renderer.createElement('polygon', 'svg');
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke', `rgba(0, 0, 200, 1)`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke-width', `${this.recStrokeWidth}`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke-dasharray', `10,10`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'd', `M5 40 l215 0`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'fill', `none`);
    this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'pointer-events', 'none');
  }

  /// Initialise les points de controle.
  private setCtrlPoints(): void {
    this.ctrlG = this.rendererService.renderer.createElement('g', 'svg');

    for (let i = 0; i < 8; i++) {
      const point = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setStyle(point, 'stroke', `black`);
      this.rendererService.renderer.setStyle(point, 'stroke-width', `1`);
      this.rendererService.renderer.setStyle(point, 'fill', `white`);

      this.rendererService.renderer.setAttribute(point, 'width', `${this.pointsSideLength}`);
      this.rendererService.renderer.setAttribute(point, 'height', `${this.pointsSideLength}`);

      this.ctrlPoints.push(point);

      this.rendererService.renderer.appendChild(this.ctrlG, point);
    }

    this.selectionTransformService.setCtrlPointList(this.ctrlPoints);
  }

  /// Initialise le rectangle d'inversement.
  private setRectInversement(): void {
    this.rectInversement = this.rendererService.renderer.createElement('rect', 'svg');
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke', `rgba(200, 0, 0, 1)`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke-width', `${this.recStrokeWidth}`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke-dasharray', `10,10`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'd', `M5 40 l215 0`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'fill', `none`);
    this.rendererService.renderer.setAttribute(this.rectInversement, 'x', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'y', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'pointer-events', 'none');
  }

  /// Retourne la liste d'objets selectionne.
  getObjectList(): SVGElement[] {
    return this.objects;
  }

  /// Retourne la position superieur gauche du rectangle de selection.
  getRectSelectionOffset(): Point {
    return this.pointsList[0];
  }

  /// Retourne si il y a une selection ou non.
  hasSelection(): boolean {
    return this.objects.length > 0;
  }

  /// Selectionne tous les objets du dessin.
  selectAll(): void {
    //this.removeSelection();
    this.drawingService.getObjectList().forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        this.objects.push(value);
      }
    });
    if (this.objects.length > 0) {
      this.wasMoved = true;
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.setSelection();
    }
  }

  /// Applique une selection sur une liste d'objets fourni.
  setNewSelection(newSelectionList: SVGElement[]): void {
    //this.removeSelection();
    newSelectionList.forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        this.objects.push(value);
      }
    });
    if (this.objects.length > 0) {
      this.wasMoved = true;
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.setSelection();
    }
  }

  /// Verifie si le curseur se situe a l'interieur de la selection.
  private isInside(x: number, y: number): boolean {
    const rectBox = this.rectSelection.getBoundingClientRect();
    return x >= rectBox.left - this.xFactor() && x <= rectBox.right - this.xFactor() && y >= rectBox.top && y <= rectBox.bottom;
  }

  /// Transforme les chiffre en string suivie de 'px' en number.
  private strToNum(str: string | null): number {
    return str ? +str.replace(/[^-?\d]+/g, ',').split(',').filter((el) => el !== '') : 0;
  }

  /// Transforme la liste de points de controle en un string.
  private pointsToString(): string {
    let pointsStr = '';
    this.pointsList.forEach((point) => {
      pointsStr += `${point.x},${point.y} `;
    });
    return pointsStr.substring(0, pointsStr.length - 1);
  }

  /// Retourne le deplacement de la barre de menu.
  private xFactor(): number {
    return (this.drawingService.drawing as SVGSVGElement).getBoundingClientRect().left;
  }
}

