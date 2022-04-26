import { Injectable } from '@angular/core';
import { ToggleDrawerService } from '../toggle-drawer/toggle-drawer.service';
import { Tools } from '../../interfaces/tools.interface';
import { ToolsService } from '../tools/tools.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { SocketService } from '@app/services/socket/socket.service';
import { DrawingService } from '../drawing/drawing.service';
import { RendererProviderService } from '../renderer-provider/renderer-provider.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { MatDialog } from '@angular/material/dialog';
import { ReinitComponent } from '@app/components/reinit/reinit.component';

/// Service permettant au sidenav de bien interagir avec les hotkeys et de bien gerer
/// sa selection d'outil. Vérifie aussi s'il s'agit du menu fichier ou d'outil
const ID_CONTROL_MENU = 7;

@Injectable({
  providedIn: 'root',
})

export class SidenavService {

  isControlMenu = false;

  public objects: Map<string, SVGElement> =  new Map<string, SVGElement>();

  constructor(
    private toggleDrawerService: ToggleDrawerService,
    private toolService: ToolsService,
    private socketService: SocketService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
    private selectionService: SelectionToolService,
    public dialog: MatDialog,
  ) {
  }

  reset() {
    this.socketService.getSocket().on("RESETDRAWING", (data)=>{
      data=JSON.parse(data);
      console.log("hmm");
      this.objects = this.drawingService.getObjectList();
      this.objects.forEach((SVGElement, number) => {
      this.drawingService.removeObject(number);
      });
      this.rendererService.renderer.removeChild(this.drawingService.drawing, this.drawingService.getObjectList());
      this.selectionService.reinit();
    });
  }

  playAudio(title: string){
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  clickreset(): void {
    this.dialog.open(ReinitComponent);
    this.playAudio("ui2.wav");
  }

  click(): void {
    this.socketService.getSocket().emit("RESETDRAWING", {});
  }
  
  /// Retourne la liste d'outils
  get toolList(): Map<number, Tools> {
    return this.toolService.tools;
  }

  /// Retourne si le drawer est ouvert
  get isOpened(): boolean {
    return this.toggleDrawerService.isOpened;
  }

  /// Retourne un index detourner pour le numero d'outil choisi
  get selectedParameter(): number {
    if (this.isControlMenu) {
      return ID_CONTROL_MENU;
    }
    return this.toolService.selectedToolId;
  }

  /// Ouvre le drawer de paramètre
  open(): void {
    this.toggleDrawerService.open();
  }

  /// Ferme le drawer de paramètre
  close(): void {
    this.toggleDrawerService.close();
    this.isControlMenu = false;
  }

  /// Change la selection d'outil
  selectionChanged(selectedItem: MatButtonToggleChange): void {
    console.log("changed", selectedItem.value);
    this.toolService.selectTool(selectedItem.value);
    this.isControlMenu = false;
  }

  /// Définit une ouverture de menu d'option fichier
  openControlMenu(): void {
    this.isControlMenu = true;
    this.open();
  }

}
