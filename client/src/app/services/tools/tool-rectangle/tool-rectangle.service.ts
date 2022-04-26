import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faSquareFull } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
// import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { FilledShape } from './filed-shape.model';
// import { RectangleCommand } from './rectangle-command';
import { SocketService } from '@app/services/socket/socket.service';
import { Point } from 'src/app/model/point.model';
//import { Point } from 'src/app/model/point.model';

/// Outil pour créer des rectangle, click suivis de bouge suivis de relache crée le rectangle
/// et avec shift créer un carrée
@Injectable({
  providedIn: 'root',
})
export class ToolRectangleService implements Tools {
  readonly faIcon: IconDefinition = faSquareFull;
  readonly toolName = 'Outil Rectangle';
  readonly id = ToolIdConstants.RECTANGLE_ID;
  private identif: string;

  private rectangle2: SVGRectElement;
  public rectangleAttributes: FilledShape;

  parameters: FormGroup;
  private strokeWidth: FormControl;
  private rectStyle: FormControl;
  private x: number;
  private y: number;
  private finalX: number;
  private finalY: number;
  private xnegatif = false;
  private ynegatif = false;

  private moving: boolean = false;


  public objects: Map<string, SVGGraphicsElement> =  new Map<string, SVGGraphicsElement>();
  public shapes: Map<string, FilledShape> =  new Map<string, FilledShape>();
  initPoints: Map<string, Point> =  new Map<string, Point>();

  renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private socketService:SocketService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.rectStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      rectStyle: this.rectStyle,
    });
  }

  setUpRectangle() {
    this.socketService.getSocket().on("STARTRECTANGLE",(data)=>{
      data=JSON.parse(data);
      this.rectangleAttributes={
        id:data.id,
        user: data.user,
        x:data.x,
        y:data.y,
        width:data.width,
        height:data.height,
        finalX: data.finalX,
        finalY: data.finalY,
        strokeWidth: data.strokeWidth,
        fill: data.fill,
        stroke: data.stroke,
        fillOpacity: data.fillOpacity,
        strokeOpacity: data.strokeOpacity,
      };

      this.x = data.x;
      this.y = data.y;

      //ce shit cest pour pas que vs code piss off
      console.log(this.x + this.y);

      this.setStyle(
        data.fill,
        data.strokeOpacity,
        data.stroke,
        data.fillOpacity,
      );

      if (data.user == this.socketService.nickname) {
        this.identif = data.id as string; 
      }

      this.renderSVG();
      this.moving = true;
    });

    this.socketService.getSocket().on("DRAWRECTANGLE",(data)=>{
      data=JSON.parse(data);
      this.finalX = data.point.x as number;
      this.finalY = data.point.y as number;
      console.log("X", data.point.x);
      console.log("Y", data.point.y);

      if (this.rectangleAttributes?.id == data.shapeId) {
        this.setSize(data.point.x as number, data.point.y as number, data.shapeId);
      }
      if (this.rectangleAttributes?.id != data.shapeId) {
        this.rectangleAttributes!.id = this.identif;
        this.setSize(data.point.x as number, data.point.y as number, data.shapeId);
      }
    });

    this.socketService.getSocket().on("ENDRECTANGLE",(data)=>{
      console.log("height", this.rectangleAttributes.height);
      console.log("width", this.rectangleAttributes.width);
      console.log("final x", this.rectangleAttributes.finalX);
      console.log("final y", this.rectangleAttributes.finalY);
      console.log("x", this.rectangleAttributes.x);
      console.log("y", this.rectangleAttributes.y);

      // this.moving = false;
    });
  }

  renderSVG(): void {
      this.rectangle2 = this.renderer.createElement('rect', 'svg');
      this.renderer.setAttribute(this.rectangle2,'id',this.rectangleAttributes?.id as string);
      this.renderer.setAttribute(this.rectangle2, 'x', this.rectangleAttributes.x.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'y', this.rectangleAttributes.y.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'width', this.rectangleAttributes.width.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'height', this.rectangleAttributes.height.toString() + 'px');
      this.renderer.setAttribute(this.rectangle2, 'stroke-width', (this.rectangleAttributes!.strokeWidth).toString() + 'px');
      this.renderer.setStyle(this.rectangle2, 'fill', this.rectangleAttributes!.fill);
      this.renderer.setStyle(this.rectangle2, 'stroke', this.rectangleAttributes!.stroke);
      this.renderer.setStyle(this.rectangle2, 'fillOpacity', this.rectangleAttributes!.fillOpacity);
      this.renderer.setStyle(this.rectangle2, 'strokeOpacity', this.rectangleAttributes!.strokeOpacity);
      this.drawingService.addObject(this.rectangle2);
      this.objects.set(this.rectangleAttributes!.id, this.rectangle2);
      this.shapes.set(this.rectangleAttributes.id, this.rectangleAttributes);
      this.initPoints.set(this.rectangleAttributes!.id, {x: this.rectangleAttributes.x, y: this.rectangleAttributes.y });

      // console.log("RENDERSVG TOOLS");
      // console.log(this.rectangle2.getAttribute('fill'));
      // console.log(this.rectangle2.getAttribute('stroke'));
      
  }


  /// Quand le bouton de la sourie est enfoncé, on crée un rectangle et on le retourne
  /// en sortie et est inceré dans l'objet courrant de l'outil.
  onPressed(event: MouseEvent): void {
    if (event.button === LEFT_CLICK) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      let rectangleObj: FilledShape;
      rectangleObj = {
        id:"",
        user: this.socketService.nickname,
        x: offset.x, 
        y: offset.y,
        width: 0, height: 0,
        finalX: 0, finalY: 0,
        strokeWidth: this.strokeWidth.value as number,
        fill: 'none', stroke: 'none', fillOpacity: 'none', strokeOpacity: 'none',
      };
      rectangleObj!.stroke = this.colorTool.primaryColorString;
      rectangleObj!.fill = this.colorTool.secondaryColorString;
      this.socketService.getSocket().emit("STARTRECTANGLE",JSON.stringify(rectangleObj));
    }
      if (event.button === RIGHT_CLICK) {
        this.setStyle(
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
        );
    }
  }

  /// Quand le bouton de la sourie est relaché, l'objet courrant de l'outil est mis a null.
  onRelease(event: MouseEvent): ICommand | void {
    //let height = this.rectangle2.getAttribute('height')?.slice(0, -2);
    //let width = this.rectangle2.getAttribute('width')?.slice(0, -2);
    let lastY = this.finalY;
    let lastX = this.finalX;
    let height = this.rectangle2.getAttribute('height')?.slice(0, -2);
    let width = this.rectangle2.getAttribute('width')?.slice(0, -2);

    this.rectangleAttributes.finalY = Math.round(+lastY!) as number;
    this.rectangleAttributes.finalX = Math.round(+lastX!) as number;
    this.rectangleAttributes.height = Math.round(+height!) as number;
    this.rectangleAttributes.width = Math.round(+width!) as number;

    if (this.xnegatif == true) {
      this.rectangleAttributes.x = Math.round(this.rectangleAttributes.x - this.rectangleAttributes.width) as number;
    }
    if (this.ynegatif == true) {
      this.rectangleAttributes.y = Math.round(this.rectangleAttributes.y - this.rectangleAttributes.height) as number;
    }

    this.ynegatif = false;
    this.xnegatif = false;

    if(this.rectangleAttributes?.height! > 1 || this.rectangleAttributes?.width! > 1) {
      this.socketService.getSocket().emit("ENDRECTANGLE", JSON.stringify(this.rectangleAttributes));
    }
    this.moving = false;
    return;
  }

  /// Quand le bouton de la sourie est apuyé et on bouge celle-ci, l'objet courrant subit des modifications.
  onMove(event: MouseEvent): void {
    if (event.button === LEFT_CLICK && this.moving == true) {
      this.socketService.getSocket().emit("DRAWRECTANGLE",JSON.stringify({ point: this.offsetManager.offsetFromMouseEvent(event), shapeId:this.identif }));
    }
  }

  /// Verification de la touche shift
  onKeyDown(event: KeyboardEvent): void {
    return;
  }

  /// Verification de la touche shift
  onKeyUp(event: KeyboardEvent): void {
    return;
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }
  
  /// Transforme le size de l'objet courrant avec un x et un y en entrée
  private setSize(mouseX: number, mouseY: number, id: string): void {
    let startX = this.initPoints.get(id)?.x as number
    let startY = this.initPoints.get(id)?.y as number
    let width = Math.abs(mouseX - startX);
    let height = Math.abs(mouseY - startY);
    let newX = 0;
    let newY = 0;

    if (mouseX < startX) {
        newX = mouseX;
        this.xnegatif = true;
    } 
    else {
        newX = startX
    }

    if (mouseY < startY) {
        newY = mouseY;
        this.ynegatif = true;
    } 
    else {
        newY = startY;
    }
    let strokeFactor = 0;
    if (!this.rectangle2 || !this.rectangleAttributes) {
      return;
    }
    if (this.rectangleAttributes.stroke !== 'none') {
      strokeFactor = this.strokeWidth.value;
      console.log(strokeFactor);
    }

    this.rectSVG(id, newX, newY, width, height);
  }

  private rectSVG(id: string, x: number, y: number, width: number, height: number): void {
    let rect = this.objects.get(id);

    if (rect !== undefined) {
      rect!.setAttribute('x', x.toString() + 'px');
      rect!.setAttribute('y', y.toString() + 'px');
      rect!.setAttribute('height', height.toString() + 'px');
      rect!.setAttribute('width', width.toString() + 'px');
    }
  }

  /// Pour definir le style du rectangle (complet, contour, centre)
  private setStyle(primaryColor: string, primaryAlpha: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.rectangleAttributes) {
      return;
    }
    switch (this.rectStyle.value) {
      case 'center':
        this.rectangleAttributes.fill = primaryColor;
        this.rectangleAttributes.fillOpacity = primaryAlpha;
        this.rectangleAttributes.stroke = 'none';
        this.rectangleAttributes.strokeOpacity = 'none';
        break;

      case 'border':
        this.rectangleAttributes.fill = 'none';
        this.rectangleAttributes.fillOpacity = 'none';
        this.rectangleAttributes.stroke = secondaryColor;
        this.rectangleAttributes.strokeOpacity = secondaryAlpha;
        break;

      case 'fill':
        this.rectangleAttributes.fill = primaryColor;
        this.rectangleAttributes.fillOpacity = primaryAlpha;
        this.rectangleAttributes.stroke = secondaryColor;
        this.rectangleAttributes.strokeOpacity = secondaryAlpha;
        break;
    }
  }

}