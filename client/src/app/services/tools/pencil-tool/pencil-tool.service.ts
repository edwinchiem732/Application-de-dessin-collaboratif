import { Injectable, RendererFactory2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faPencilAlt, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_WIDTH, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { Pencil } from './pencil.model';
import { Renderer2 } from '@angular/core';
import { Point } from 'src/app/model/point.model';
import { SocketService } from '@app/services/socket/socket.service';


/// Service de l'outil pencil, permet de créer des polyline en svg
/// Il est possible d'ajuster le stroke width dans le form
@Injectable({
  providedIn: 'root',
})
export class PencilToolService implements Tools {
  readonly toolName = 'Outil Crayon';
  readonly faIcon: IconDefinition = faPencilAlt;
  readonly id = ToolIdConstants.PENCIL_ID;
  private strokeWidth: FormControl;
  public pencil: Pencil | null;
  private pencil3: SVGPathElement;
  parameters: FormGroup;
  private identif: string;

  // private dot: SVGCircleElement | null = null;

  private moving: boolean = false;

  public objects: Map<string, SVGGraphicsElement> =  new Map<string, SVGGraphicsElement>();
  public shapes: Map<string, Pencil> =  new Map<string, Pencil>();

  renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private socketService:SocketService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(INITIAL_WIDTH);
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
    });

  }

  setUpPencil() {
    this.socketService.getSocket().on("STARTLINE",(data)=>{
      data=JSON.parse(data);
      this.pencil={
        id:data.id,
        user:data.user,
        pointsList:data.pointsList,
        strokeWidth:data.strokeWidth,
        fill:data.fill,
        stroke:data.stroke,
        fillOpacity:data.fillOpacity,
        strokeOpacity:data.strokeOpacity,
      };
      
      if (data.user == this.socketService.nickname) {
        console.log(data.user);
        console.log(this.socketService.nickname);
        this.identif = this.pencil.id as string;
      }

      console.log("string", data);
      console.log("pencil", this.pencil);
      console.log("id", this.pencil.id);
      console.log("HERE IDDDDD", data.id);
  

      this.renderSVG();
      this.moving = true;
    });

    this.socketService.getSocket().on("DRAWLINE",(data)=>{
      data=JSON.parse(data);

      console.log("DRAWING LINE");

      if (this.pencil?.id == data.shapeId) {
        this.addPointToLine({x:data.point.x, y:data.point.y} as Point, data.shapeId);
      }
      if (this.pencil?.id != data.shapeId) {
        this.pencil!.id = this.identif;
        this.addPointToLine({x:data.point.x, y:data.point.y} as Point, data.shapeId);
      }
    });

    this.socketService.getSocket().on("ENDLINE",(data)=>{
      this.moving = false;
      console.log(data);
    });

  }

  renderSVG(): void {
    this.pencil3 = this.renderer.createElement('path', 'svg');
    this.renderer.setAttribute(this.pencil3,'id',this.pencil?.id as string);
    this.renderer.setAttribute(this.pencil3, 'd', 'M ' + this.pencil!.pointsList[0].x.toString() + ' ' + this.pencil!.pointsList[0].y.toString());
    this.renderer.setAttribute(this.pencil3, 'stroke-width', (this.pencil!.strokeWidth).toString() + 'px');
    this.renderer.setStyle(this.pencil3, 'fill', 'none');
    this.renderer.setStyle(this.pencil3, 'stroke', this.pencil!.stroke);
    this.renderer.setStyle(this.pencil3, 'stroke-linecap', 'round');
    this.renderer.setStyle(this.pencil3, 'stroke-linejoin', 'round')
    this.renderer.setStyle(this.pencil3, 'fillOpacity', this.pencil!.fillOpacity);
    this.renderer.setStyle(this.pencil3, 'strokeOpacity', this.pencil!.strokeOpacity);
    this.drawingService.addObject(this.pencil3);
    this.objects.set(this.pencil!.id, this.pencil3);
    this.shapes.set(this.pencil?.id!, this.pencil!);
  }

  addPointToLine(point: Point, id: string): void {
    this.pencil?.pointsList.push(point);
    let line = this.objects.get(id);
    line!.setAttribute('d', (line!.getAttribute('d') as string) + ' L ' + point.x.toString() + ' ' + point.y.toString());
}

  /// Création d'un polyline selon la position de l'evenement de souris, choisi les bonnes couleurs selon le clique de souris
  onPressed(event: MouseEvent): void {
    // START TO DRAW
    if (event.button === LEFT_CLICK) {
      if (this.strokeWidth.valid) {
       const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);

        // INITIALISE PENCIL
        let pencilObj = {
          id:"",
          user: this.socketService.nickname,
          pointsList:[offset],
          strokeWidth: this.strokeWidth.value,
          fill: 'none',
          stroke: 'none',
          fillOpacity: 'none',
          strokeOpacity: 'none',
        } as Pencil;

        pencilObj!.stroke = this.colorTool.primaryColorString;
        pencilObj!.strokeOpacity = this.colorTool.primaryAlpha.toString();

        this.socketService.getSocket().emit("STARTLINE",JSON.stringify(pencilObj));
      }
    }
    // FOR CHOOSING COLOR ON SIDEBAR
    if (event.button === RIGHT_CLICK) {
      this.pencil!.stroke = this.colorTool.primaryColorString;
      this.pencil!.strokeOpacity = this.colorTool.primaryAlpha.toString();
    }
  }

  /// Réinitialisation de l'outil après avoir laisser le clique de la souris
  onRelease(event: MouseEvent): void | ICommand {
    // this.socketService.getSocket().emit("ENDLINE", JSON.stringify(this.pencil));
    console.log("BEFORE", this.pencil?.pointsList.length);
    if(this.pencil?.pointsList.length! > 1) {
      this.socketService.getSocket().emit("ENDLINE", JSON.stringify(this.pencil));
      console.log("AFTER", this.pencil?.pointsList.length);
    }
    return;
  }

  /// Ajout d'un point selon le déplacement de la souris
  onMove(event: MouseEvent): void {
    if (event.button === LEFT_CLICK && this.moving == true) {
      this.socketService.getSocket().emit("DRAWLINE",JSON.stringify({ point: this.offsetManager.offsetFromMouseEvent(event), shapeId:this.identif } ));
    }  
  }

  onKeyUp(event: KeyboardEvent): void {
    return;
  }
  onKeyDown(event: KeyboardEvent): void {
    return;
  }
  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }
}