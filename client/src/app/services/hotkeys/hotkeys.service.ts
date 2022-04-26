import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
//import { NewDrawingComponent } from 'src/app/components/new-drawing/new-drawing.component';
//import { ExportDialogService } from '../export-dialog/export-dialog.service';
//import { OpenDrawingDialogService } from '../open-drawing-dialog/open-drawing-dialog.service';
//import { SaveDrawingDialogService } from '../save-drawing-dialog/save-drawing-dialog.service';
import { SidenavService } from '../sidenav/sidenav.service';
import { CopyPasteToolService } from '../tools/copy-paste-tool/copy-paste-tool.service';
import { DeletingToolService } from '../tools/selection-tool/delete-command/delete-tool.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { ToolIdConstants } from '../tools/tool-id-constants';
import { ToolsService } from '../tools/tools.service';
import { EmitReturn } from './hotkeys-constants';
import { HotkeysEmitterService } from './hotkeys-emitter/hotkeys-emitter.service';
import { HotkeysEnablerService } from './hotkeys-enabler.service';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { French, English } from '@app/interfaces/Langues';


@Injectable({
  providedIn: 'root',
})
export class HotkeysService {

  private readonly BASE_URL: string = URL;

  private toolSelectorList: Map<string, number> = new Map<string, number>();
  hotkey: Map<string, any> = new Map<string, any>();

  private on: string;
  private off: string;

  constructor(
    private dialog: MatDialog,
    private sideNavService: SidenavService,
    private toolsService: ToolsService,
    //private saveDrawingDialogService: SaveDrawingDialogService,
    //private exportDialogService: ExportDialogService,
    private copyPasteService: CopyPasteToolService,
    private selectionTool: SelectionToolService,
    private deletingTool: DeletingToolService,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    //private openDrawingService: OpenDrawingDialogService,

    private hotkeysEmitterService: HotkeysEmitterService,

    private hotkeysEnablerService: HotkeysEnablerService,
  ) {
    this.subscribeToHotkeys();

    this.toolSelectorList.set(EmitReturn.PENCIL, ToolIdConstants.PENCIL_ID);
    this.toolSelectorList.set(EmitReturn.RECTANGLE, ToolIdConstants.RECTANGLE_ID);
    this.toolSelectorList.set(EmitReturn.ELLIPSE, ToolIdConstants.ELLIPSE_ID);
    this.toolSelectorList.set(EmitReturn.LINE, ToolIdConstants.LINE_ID);
    this.toolSelectorList.set(EmitReturn.SELECTION, ToolIdConstants.SELECTION_ID);
    this.toolSelectorList.set(EmitReturn.POLYGON, ToolIdConstants.POLYGON_ID);
    this.toolSelectorList.set(EmitReturn.ERASER, ToolIdConstants.ERASER_ID);
    this.dialog.afterOpened.subscribe(() => {
      this.hotkeysEnablerService.disableHotkeys();
      this.hotkeysEnablerService.canClick = false;
    });
    this.dialog.afterAllClosed.subscribe(() => {
      this.hotkeysEnablerService.enableHotkeys();
      this.hotkeysEnablerService.canClick = true;
    });
  }

  /// Dispatch l'evenement de key down vers les services de hotkeys
  hotkeysListener(): void {
    window.addEventListener('keydown', (event) => {
      this.hotkeysEmitterService.handleKeyboardEvent(event);
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

  /// Subscribe au hotkeys pour effectuer l'action associé
  private subscribeToHotkeys(): void {
    this.hotkeysEmitterService.hotkeyEmitter.subscribe((value: EmitReturn) => {
      //const toolId: number | undefined = this.toolSelectorList.get(value);
      if (ToolIdConstants) {
        if(this.socketService.language == "french") {
          this.on = French.on;
          this.off = French.off;
        }  
        else {
          this.on = English.on;
          this.off = English.off;
        }
        switch (value) {
          case EmitReturn.MUTE:
            this.socketService.mute = true;
              this.snackBar.open(this.off,'', { duration: 3000 });
            break;

          case EmitReturn.UNMUTE:
            this.socketService.mute = false;
            this.snackBar.open(this.on,'', { duration: 3000 });
            this.playAudio("bell.wav");
            break;

          case EmitReturn.CHAT:
              this.socketService.joinRoom('DEFAULT');
              this.socketService.currentRoom = 'DEFAULT';
              let link2 = this.BASE_URL + "room/joinRoom";

              const userObj={
                useremail:this.socketService.email,
                nickname:this.socketService.nickname,
              }

              this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
                catchError(async (err) => console.log("error catched" + err))
              ).subscribe((data: any) => {
            
                if(data.message == "success") {
                  this.socketService.currentRoom = 'DEFAULT';
                  console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
                  this.router.navigate(['/', 'clavardage']);
                }
              });
              break;

          case EmitReturn.PENCIL:
              this.sideNavService.open();
              this.sideNavService.isControlMenu = false;
              this.toolsService.selectTool(2);
              break;
            case EmitReturn.RECTANGLE:
              this.sideNavService.open();
              this.sideNavService.isControlMenu = false;
              this.toolsService.selectTool(3);
              break;
            case EmitReturn.ELLIPSE:
              this.sideNavService.open();
              this.sideNavService.isControlMenu = false;
              this.toolsService.selectTool(4);
              break;
            case EmitReturn.SELECTION:
              this.sideNavService.open();
              this.sideNavService.isControlMenu = false;
              this.toolsService.selectTool(0);
              break;
        }
        //this.sideNavService.open();
        //this.sideNavService.isControlMenu = false;
        //this.toolsService.selectTool(toolId);
      } else {
        switch (value) {
          /*case EmitReturn.NEW_DRAWING:
            this.dialog.open(NewDrawingComponent, {});
            break;
          case EmitReturn.SAVE_DRAWING:
            this.saveDrawingDialogService.openDialog();
            break;
          case EmitReturn.EXPORT_DRAWING:
            this.exportDialogService.openDialog();
            break;
          case EmitReturn.OPEN_DRAWING:
            this.openDrawingService.openDialog();
            break;*/
          case EmitReturn.COPY:
            this.copyPasteService.copy();
            break;
          case EmitReturn.CUT:
            this.copyPasteService.cut();
            break;
          case EmitReturn.PASTE:
            this.copyPasteService.paste();
            break;
          case EmitReturn.DUPLICATE:
            this.copyPasteService.duplicate();
            break;
          case EmitReturn.DELETE:
            this.deletingTool.deleteSelection();
            break;
          case EmitReturn.SELECTALL:
            this.selectionTool.selectAll();
            break;
          default:
            console.log('Warning : Hotkey callBack not implemented !');
            break;
        }
      }
    });
  }
}
