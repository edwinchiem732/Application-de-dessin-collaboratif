import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { FilledShape } from '../tool-rectangle/filed-shape.model';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { SocketService } from '@app/services/socket/socket.service';
// import { EllipseCommand } from './ellipse-command';
import { Point } from 'src/app/model/point.model';

/// Outil pour créer des ellipse, click suivis de bouge suivis de relache crée l'ellipse
/// et avec shift créer un cercle
@Injectable({
  providedIn: 'root',
})
export class ToolEllipseService implements Tools {
  readonly faIcon: IconDefinition = faCircle;
  readonly toolName = 'Outil Ellipse';
  readonly id = ToolIdConstants.ELLIPSE_ID;
  private identif: string;

  private ellipse2: SVGEllipseElement;
  public ellipseAttributes: FilledShape;
  private contour: SVGRectElement | null;
  // private contourId: number;

  parameters: FormGroup;
  private strokeWidth: FormControl;
  private ellipseStyle: FormControl;
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
    private socketService: SocketService,
    private rendererService: RendererProviderService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.ellipseStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      ellipseStyle: this.ellipseStyle,
    });
  }

  setUpEllipse() : void {
    this.socketService.getSocket().on("STARTELLIPSE", (data) => {
      data = JSON.parse(data);
      this.ellipseAttributes = {
        id: data.id,
        user: data.user,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        finalX: data.finalX,
        finalY: data.finalY,
        strokeWidth: data.strokeWidth,
        fill: data.fill,
        stroke: data.stroke,
        fillOpacity: data.fillOpacity,
        strokeOpacity: data.strokeOpacity
      }

      this.x = data.x;
      this.y = data.y;

      console.log(this.x + this.y);

      this.setStyle(
        data.fill,
        data.strokeOpacity,
        data.stroke,
        data.fillOpacity,
      ); 

      if(data.user == this.socketService.nickname) {
        this.identif = data.id as string;
      }

      this.renderSVG();
      this.moving = true;
    });

    this.socketService.getSocket().on("DRAWELLIPSE", (data) => {
      data = JSON.parse(data);
      this.finalX = data.point.x as number;
      this.finalY = data.point.y as number;

      if (this.ellipseAttributes?.id == data.shapeId) {
        this.setSize(data.point.x as number, data.point.y as number, data.shapeId);
      }
      if (this.ellipseAttributes?.id != data.shapeId) {
        this.ellipseAttributes!.id = this.identif;
        this.setSize(data.point.x as number, data.point.y as number, data.shapeId);
      }
    });
    
    this.socketService.getSocket().on("ENDELLIPSE", (data) => {
      // this.moving = false;
      console.log("height", this.ellipseAttributes.height);
      console.log("height", this.ellipseAttributes.width);
    });
  }


  renderSVG(): void {
    this.ellipse2 = this.renderer.createElement('ellipse', 'svg');
    this.renderer.setAttribute(this.ellipse2,'id',this.ellipseAttributes?.id as string);
    this.renderer.setAttribute(this.ellipse2, 'cx', this.ellipseAttributes.x.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'cy', this.ellipseAttributes.y.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'width', this.ellipseAttributes.width.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'height', this.ellipseAttributes.height.toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'rx', (this.ellipseAttributes.width / 2).toString() + 'px');
    this.renderer.setAttribute(this.ellipse2, 'ry', (this.ellipseAttributes.height / 2).toString() + 'px');
    this.renderer.setStyle(this.ellipse2, 'stroke-width', this.ellipseAttributes!.strokeWidth.toString() + 'px');
    this.renderer.setStyle(this.ellipse2, 'fill', this.ellipseAttributes!.fill);
    this.renderer.setStyle(this.ellipse2, 'stroke', this.ellipseAttributes!.stroke);
    this.renderer.setStyle(this.ellipse2, 'fillOpacity', this.ellipseAttributes!.fillOpacity);
    this.renderer.setStyle(this.ellipse2, 'strokeOpacity', this.ellipseAttributes!.strokeOpacity);
    this.drawingService.addObject(this.ellipse2);
    this.objects.set(this.ellipseAttributes!.id, this.ellipse2);
    this.shapes.set(this.ellipseAttributes.id, this.ellipseAttributes);
    this.initPoints.set(this.ellipseAttributes!.id, {x: this.ellipseAttributes.x, y: this.ellipseAttributes.y });
    //console.log("ca dessine un ellipse");
}

  /// Quand le bouton de la sourie est enfoncé, on crée un ellipse et on le retourne
  /// en sortie et est inceré dans l'objet courrant de l'outil.
  onPressed(event: MouseEvent): void {
    if (event.button === LEFT_CLICK) {
      this.contour = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setStyle(this.contour, 'stroke', `rgba(0, 0, 0, 1)`);
      this.rendererService.renderer.setStyle(this.contour, 'stroke-width', `1`);
      this.rendererService.renderer.setStyle(this.contour, 'stroke-dasharray', `10,10`);
      this.rendererService.renderer.setStyle(this.contour, 'd', `M5 40 l215 0`);
      this.rendererService.renderer.setStyle(this.contour, 'fill', `none`);
      // if (this.contour) {
      //   this.contourId = this.drawingService.addObject(this.contour);
      // }

      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      // this.oldX = offset.x;
      // this.oldY = offset.y;

      let ellipse: FilledShape;
      ellipse = {
        id: "",
        user: this.socketService.nickname,
        x: offset.x, y: offset.y,
        width: 0, height: 0,
        finalX: 0, finalY: 0,
        strokeWidth: this.strokeWidth.value as number,
        fill: 'none', stroke: 'none', fillOpacity: 'none', strokeOpacity: 'none',
      };
      ellipse!.stroke = this.colorTool.primaryColorString;
      ellipse!.fill = this.colorTool.secondaryColorString;

      this.socketService.getSocket().emit("STARTELLIPSE", JSON.stringify(ellipse));

      }
       if(event.button === RIGHT_CLICK) {
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
    let lastY = this.finalY;
    let lastX = this.finalX;
    let height = this.ellipse2.getAttribute('height')?.slice(0, -2);
    let width = this.ellipse2.getAttribute('width')?.slice(0, -2);

    this.ellipseAttributes.finalY = Math.round(+lastY!) as number;
    this.ellipseAttributes.finalX = Math.round(+lastX!) as number;
    this.ellipseAttributes.height = Math.round(+height!) as number;
    this.ellipseAttributes.width = Math.round(+width!) as number;

    if (this.xnegatif == true) {
      this.ellipseAttributes.x = Math.round((this.ellipseAttributes.x - this.ellipseAttributes.width/2)) as number;
    }
    else {
      this.ellipseAttributes.x = Math.round((this.ellipseAttributes.x + this.ellipseAttributes.width/2)) as number;
    }
    if (this.ynegatif == true) {
      this.ellipseAttributes.y = Math.round((this.ellipseAttributes.y - this.ellipseAttributes.height/2)) as number;
    }
    else {
      this.ellipseAttributes.y = Math.round((this.ellipseAttributes.y + this.ellipseAttributes.height/2)) as number;
    }

    this.ynegatif = false;
    this.xnegatif = false;

    if(this.ellipseAttributes?.height! > 1 || this.ellipseAttributes?.width! > 1) {
    this.socketService.getSocket().emit("ENDELLIPSE", JSON.stringify(this.ellipseAttributes));
    }
    this.moving = false;
    return;
  }

  /// Quand le bouton de la sourie est apuyé et on bouge celle-ci, l'objet courrant subit des modifications.
  onMove(event: MouseEvent): void {
    if(event.button === LEFT_CLICK && this.moving == true) {
      this.socketService.getSocket().emit("DRAWELLIPSE",JSON.stringify({ point: this.offsetManager.offsetFromMouseEvent(event), shapeId:this.identif }));
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
  private setSize(mouseX: number, mouseY: number, id:string): void {
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
    newX += width / 2;
    newY += height / 2;
    let strokeFactor = 0;
    if (!this.ellipse2 || !this.ellipseAttributes) {
      return;
    }
    if (this.ellipseAttributes.stroke !== 'none') {
      strokeFactor = this.strokeWidth.value;
      console.log(strokeFactor);
    }

    this.ellipSVG(id, newX, newY, width, height);

    // this.rendererService.renderer.setAttribute(this.contour, 'x', (this.ellipseAttributes.x - width / 2).toString());
    // this.rendererService.renderer.setAttribute(this.contour, 'y', (this.ellipseAttributes.y - height / 2).toString());
    // this.rendererService.renderer.setAttribute(this.contour, 'width', (width).toString());
    // this.rendererService.renderer.setAttribute(this.contour, 'height', (height).toString());
  }

  private ellipSVG(id: string, x: number, y: number, width: number, height: number): void {
    let ellip = this.objects.get(id);

    if (ellip !== undefined) {
      ellip!.setAttribute('cx', x.toString() + 'px');
      ellip!.setAttribute('cy', y.toString() + 'px');
      ellip!.setAttribute('height', height.toString() + 'px');
      ellip!.setAttribute('width', width.toString() + 'px');
      ellip!.setAttribute('rx', ((width/2).toString()) + 'px');
      ellip!.setAttribute('ry', ((height/2).toString()) + 'px');

      this.rendererService.renderer.setAttribute(this.contour, 'x', (x - width / 2).toString());
      this.rendererService.renderer.setAttribute(this.contour, 'y', (y - height / 2).toString());
      this.rendererService.renderer.setAttribute(this.contour, 'width', (width).toString());
      this.rendererService.renderer.setAttribute(this.contour, 'height', (height).toString());
    }
  }

  /// Ajustement du style de l'ellipse
  private setStyle(primaryColor: string, primaryAlphas: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.ellipseAttributes) {
      return;
    }
    switch (this.ellipseStyle.value) {
      case 'center':
        this.ellipseAttributes.fill = primaryColor;
        this.ellipseAttributes.fillOpacity = primaryAlphas;
        this.ellipseAttributes.stroke = 'none';
        this.ellipseAttributes.strokeOpacity = 'none';
        break;

      case 'border':
        this.ellipseAttributes.fill = 'none';
        this.ellipseAttributes.fillOpacity = 'none';
        this.ellipseAttributes.stroke = secondaryColor;
        this.ellipseAttributes.strokeOpacity = secondaryAlpha;
        break;

      case 'fill':
        this.ellipseAttributes.fill = primaryColor;
        this.ellipseAttributes.fillOpacity = primaryAlphas;
        this.ellipseAttributes.stroke = secondaryColor;
        this.ellipseAttributes.strokeOpacity = secondaryAlpha;
        break;
    }
  }
}