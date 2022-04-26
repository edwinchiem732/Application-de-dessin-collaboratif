import { Component, HostListener, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';
import { DEFAULT_RGB_COLOR } from 'src/app/model/rgb.model';
import { DEFAULT_ALPHA } from 'src/app/model/rgba.model';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { NewDrawingService } from 'src/app/services/new-drawing/new-drawing.service';
import { NewDrawingAlertComponent } from './new-drawing-alert/new-drawing-alert.component';
import { SocketService } from '@app/services/socket/socket.service';
import { DrawingTempService } from '@app/services/drawingTemp.service';
import { BaseShapeInterface } from '@app/interfaces/BaseShapeInterface';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
import { FilledShape } from '@app/services/tools/tool-rectangle/filed-shape.model';
import { Pencil } from '@app/services/tools/pencil-tool/pencil.model';
import { checkLine } from '@app/interfaces/LineInterface';
import { checkEllipse } from '@app/interfaces/EllipseInterface';
import { checkRectangle } from '@app/interfaces/RectangleInterface';
import { Point } from 'src/app/model/point.model';
import { SelectionToolService } from '@app/services/tools/selection-tool/selection-tool.service';
import { SidenavService } from '@app/services/sidenav/sidenav.service';

// const ONE_SECOND = 1000;
@Component({
  selector: 'app-new-drawing',
  templateUrl: './new-drawing.component.html',
  styleUrls: ['./new-drawing.component.scss'],
  providers: [
    NewDrawingService,
  ],
})
export class NewDrawingComponent implements OnInit {
  form: FormGroup;

  renderer: Renderer2;
  public rectangleAttributes: FilledShape;

  public pencil: Pencil | null;
  private pencil3: SVGPathElement;

  public ellipseAttributes: FilledShape;

  constructor( 
    public dialogRef: MatDialogRef<NewDrawingComponent>,
    public drawingTempSerivce: DrawingTempService,
    private socketService: SocketService,
    // private snackBar: MatSnackBar,
    private newDrawingService: NewDrawingService,
    private drawingService: DrawingService,
    private dialog: MatDialog,
    private colorPickerService: ColorPickerService,
    public pencilToolService: PencilToolService,
    public toolEllipseService: ToolEllipseService,
    public toolRectangleService: ToolRectangleService,
    private selectionService: SelectionToolService,
    rendererFactory: RendererFactory2,
    public sidenavService: SidenavService, 
  ) { 
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /// Créer un nouveau form avec les dimensions et la couleur
  ngOnInit(): void {
    this.pencilToolService.setUpPencil();
    this.toolRectangleService.setUpRectangle();
    this.toolEllipseService.setUpEllipse();
    this.selectionService.setUpSelection();
    this.sidenavService.reset();
    this.newDrawing();
    this.form = new FormGroup(
      {
        dimension: this.newDrawingService.form,
        color: this.colorPickerService.colorForm,
      },
    );
    this.dialogRef.disableClose = true;
    this.dialogRef.afterOpened().subscribe(() => this.onResize());
    this.colorPickerService.setFormColor(DEFAULT_RGB_COLOR, DEFAULT_ALPHA);

  
    console.log("AVANT");
    console.log("LOL", this.socketService.currentRoom);
    let drawingObj = this.drawingTempSerivce.drawings.get(this.socketService.currentRoom);
    drawingObj?.getElementsInterface().forEach((element:BaseShapeInterface)=>{
      console.log("FOREACHE");
      if(checkLine(element)) {
        this.pencilToolService.pencil = element;
        if(element.pointsList != undefined) {
          this.pencil3 = this.renderer.createElement('path', 'svg');
          this.renderer.setAttribute(this.pencil3,'id',element.id as string);
          this.renderer.setAttribute(this.pencil3, 'd', 'M ' + element.pointsList[0].x.toString() + ' ' + element.pointsList[0].y.toString());
          this.renderer.setAttribute(this.pencil3, 'stroke-width', (element.strokeWidth).toString() + 'px');
          this.renderer.setStyle(this.pencil3, 'fill', 'none');
          this.renderer.setStyle(this.pencil3, 'stroke', element.stroke);
          this.renderer.setStyle(this.pencil3, 'stroke-linecap', 'round');
          this.renderer.setStyle(this.pencil3, 'stroke-linejoin', 'round')
          this.renderer.setStyle(this.pencil3, 'fillOpacity', element.fillOpacity);
          this.renderer.setStyle(this.pencil3, 'strokeOpacity', element.strokeOpacity);
          this.drawingService.addObject(this.pencil3);
          this.pencilToolService.objects.set(element.id, this.pencil3);
          this.pencilToolService.shapes.set(element.id, element);
          let index = element.pointsList.length;
          for(let i = 0; i < element.pointsList.length; i++) {
            if(i < index) {
              this.addPointToLine(element.pointsList[i]);
            }
          }
        }
      }
      if(checkEllipse(element)) {
        this.toolEllipseService.ellipseAttributes = element;
        this.toolEllipseService.renderSVG();
      }
      if(checkRectangle(element)) {
        this.toolRectangleService.rectangleAttributes = element;
        this.toolRectangleService.renderSVG();
      }
  });
  console.log("DERNIER");
  }

  get sizeForm(): FormGroup {
    return (this.form.get('dimension') as FormGroup).get('size') as FormGroup;
  }

  addPointToLine(point: Point): void {
    let line = this.pencil3;
    line!.setAttribute('d', (line!.getAttribute('d') as string) + ' L ' + point.x.toString() + ' ' + point.y.toString());
  }


  /// Ouvre le dialog pour l'alerte lorsque le service est creer
  onAccept(): void {
    if (this.drawingService.isCreated) {
      const alert = this.dialog.open(NewDrawingAlertComponent, {
        role: 'alertdialog',
      });
      alert.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.newDrawing();
        }
      });
    } else {
      this.newDrawing();
      console.log("RESET");
    }
  }

  /// Cree un nouveau dessin
  private newDrawing() {
    this.drawingService.isCreated = true;
    // const size: { width: number, height: number } = this.newDrawingService.sizeGroup.value;
    const size: { width: number, height: number } = {width: 1280, height: 996};
    this.drawingService.newDrawing(
      size.width,
      size.height,
      // {
      //   rgb: this.colorPickerService.rgb.value,
      //   a: this.colorPickerService.a.value,
      // },
    );
    // this.snackBar.open('Nouveau dessin créé', '', { duration: ONE_SECOND, });
    this.newDrawingService.form.reset();
    this.dialogRef.close();
  }

  /// Ferme le dialogue
  onCancel(): void {
    this.dialogRef.close();
  }

  /// Ecoute pour un changement de la grandeur du window
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.newDrawingService.onResize();
  }

}
