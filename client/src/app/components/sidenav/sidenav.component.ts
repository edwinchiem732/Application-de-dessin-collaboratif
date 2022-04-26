import { Component } from '@angular/core';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { Tools } from 'src/app/interfaces/tools.interface';
import { ToolsService } from 'src/app/services/tools/tools.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { UsersComponent } from '../users/users.component';
import { SocketService } from '@app/services/socket/socket.service';
//import { DrawingService } from '@app/services/drawing/drawing.service';
//import { RendererProviderService } from '@app/services/renderer-provider/renderer-provider.service';
//import { SocketService } from '@app/services/socket/socket.service';
//import { NewDrawingComponent } from '../../components/new-drawing/new-drawing.component';
//import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})

export class SidenavComponent {

  public objects: Map<string, SVGElement> =  new Map<string, SVGElement>();

  constructor(
    //private dialog: MatDialog, 
    private socketService: SocketService,
    private sideNavService: SidenavService, 
    private toolService: ToolsService,
    public dialog: MatDialog,
    //private drawingService: DrawingService,
    //private rendererService: RendererProviderService,
    //private socketService: SocketService,
    ) { }

  get currentToolId(): number {
    return this.toolService.selectedToolId;
  }

  get toolList(): Map<number, Tools> {
    return this.sideNavService.toolList;
  }

  get isOpened(): boolean {
    return this.sideNavService.isOpened;
  }

  /// Choisit un parametre
  get selectedParameter(): number {
    return this.sideNavService.selectedParameter;
  }

  // Reinitialisation du dessin
  openNewDrawing(): void {
    /*this.objects = this.drawingService.getObjectList();
    this.objects.forEach((SVGElement, number) => {
      this.drawingService.removeObject(number);
    });
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.drawingService.getObjectList());*/
    //this.socketService.getSocket().emit("RESETDRAWING", {});
    this.sideNavService.clickreset();
    //this.dialog.open(NewDrawingComponent, {});
  }

  /// Ouvre le sidenav
  open(): void {
    this.sideNavService.open();
  }

  /// Ferme le sidenav
  close(): void {
    this.sideNavService.close();
  }

  openUsers() {
    this.dialog.open(UsersComponent);
    this.playAudio("ui2.wav");
  }

  playAudio(title: string){
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  /// Changer la selection avec un toggle button
  selectionChanged(selectedItem: MatButtonToggleChange): void {
    console.log("changed2", selectedItem);
    this.sideNavService.selectionChanged(selectedItem);
  }

  /// Ouvre le menu control
  openControlMenu(): void {
    this.sideNavService.openControlMenu();
  }

}
