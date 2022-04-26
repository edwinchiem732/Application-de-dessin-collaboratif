import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { Subscription } from 'rxjs';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { URL } from '../../../../constants';
import { Router } from '@angular/router';
import { SelectionToolService } from '@app/services/tools/selection-tool/selection-tool.service';
import { NewAlbumComponent } from '../new-album/new-album.component';
import { Album } from '@app/classes/Album';
import { AlbumInterface } from '@app/interfaces/AlbumInterface';
import { French, English} from '@app/interfaces/Langues';
import { AlbumTempService } from '@app/services/albumTempService';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { ModifyAlbumComponent } from '../modify-album/modify-album.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SidenavService } from '@app/services/sidenav/sidenav.service';
import { AcceptRequestComponent } from '../accept-request/accept-request.component';
import { LogoutComponent } from '../logout/logout.component';
// import { RouterOutlet } from '@angular/router';
// import { fader } from '@assets/animations';

const ONE_SECOND = 1000;

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
  // animations: [fader],
})

export class AlbumsComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  public AlbumsNames:Array<string> = [];
  public AlbumsVisibilite:Array<string> = [];
  public AlbumsCreationDate:Array<number> = [];
  public compteur:number = 0;
  public numberOfAlbums: number;

  public albumTitle: string;
  public creaAlbum: string;
  public accoutMenu: string;
  public open: string;
  public delete: string;
  public goChat: string;
  public prop: string;
  public quit: string;
  public default: string;
  filteredAlphaAsc: string;
  filteredAlphaDes: string;
  filteredDateAsc: string;
  filteredDateDesc: string;
  leavePublicAlbum: string;
  leftAlbum: string;

  private request: string;
  private iscreator: string;
  private notcreator: string;
  private notmember: string

  public toggleSortAlpha = true;
  public toggleSortCreation = true;
  public order:Array<number> = [];
  public kk = false;
  public alert: string

  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private hotkeyService: HotkeysService,
    private pencilService:PencilToolService,
    private rectangleService:ToolRectangleService,
    private ellipseService:ToolEllipseService,
    private selectionService: SelectionToolService,
    public albumTempSerivce: AlbumTempService,
    private snackBar: MatSnackBar,
    public sidenavService: SidenavService, 
  ) { 
      this.hotkeyService.hotkeysListener();
      this.hotkeyService.hotkeysListener();
    }

  ngOnInit(): void {
    this.pencilService.setUpPencil();
    this.rectangleService.setUpRectangle();
    this.ellipseService.setUpEllipse();
    this.selectionService.setUpSelection();
    this.sidenavService.reset();
    this.getAllAlbums();
    this.roomListener();

    if(this.socketService.language == "french") {
     this.creaAlbum = French.createAlbum;
     this.accoutMenu = French.menuCompte;
     this.open = French.open;
     this.delete = French.delete;
     this.goChat = French.goChat;
     this.request = French.request;
     this.iscreator = French.iscreator;
     this.notcreator = French.notcreator;
     this.notmember = French.notmember;
     this.prop = French.prop;
     this.quit = French.quit;
     this.filteredAlphaAsc = French.filteredAlphaAsc;
     this.filteredAlphaDes = French.filteredAlphaDes;
     this.filteredDateAsc = French.filteredDateAsc;
     this.filteredDateDesc = French.filteredDateDesc;
     this.leavePublicAlbum = French.leavePublicAlbum;
     this.leftAlbum = French.leftAlbum;
     this.default = French.default;
     this.alert = French.alert;
    }
    else {
      this.creaAlbum = English.createAlbum;
      this.accoutMenu = English.menuCompte;
      this.open = English.open;
      this.delete = English.delete;
      this.goChat = English.goChat;
      this.request = English.request;
      this.iscreator = English.iscreator;
      this.notcreator = English.notcreator;
      this.notmember = English.notmember;
      this.prop = English.prop;
      this.quit = English.quit;
      this.filteredAlphaAsc = English.filteredAlphaAsc;
      this.filteredAlphaDes = English.filteredAlphaDes;
      this.filteredDateAsc = English.filteredDateAsc;
      this.filteredDateDesc = English.filteredDateDesc;
      this.leavePublicAlbum = English.leavePublicAlbum;
      this.leftAlbum = English.leftAlbum;
      this.default = English.default;
      this.alert = English.alert;
    }
    if(this.socketService.theme == "light grey"){
      document.getElementById("createAlbum")!.style.backgroundColor = LightGrey.main;
      document.getElementById("createAlbum")!.style.color = LightGrey.text;
      document.getElementById("menuCompte")!.style.backgroundColor = LightGrey.main;
      document.getElementById("menuCompte")!.style.color = LightGrey.text;
      document.getElementById("chatRoom")!.style.backgroundColor = LightGrey.main;
      document.getElementById("chatRoom")!.style.color = LightGrey.text;
      document.getElementById("title3")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title3")!.style.color = LightGrey.text;
      document.getElementById("sortAlpha")!.style.backgroundColor = LightGrey.main;
      document.getElementById("sortAlpha")!.style.color = LightGrey.text;
      document.getElementById("sortCreate")!.style.backgroundColor = LightGrey.main;
      document.getElementById("sortCreate")!.style.color = LightGrey.text;
      document.getElementById("albumModifier")!.style.backgroundColor = LightGrey.main;
      document.getElementById("albumModifier")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("createAlbum")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("createAlbum")!.style.color = DarkGrey.text;
      document.getElementById("menuCompte")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("menuCompte")!.style.color = DarkGrey.text;
      document.getElementById("chatRoom")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("chatRoom")!.style.color = DarkGrey.text;
      document.getElementById("title3")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title3")!.style.color = DarkGrey.text;
      document.getElementById("sortAlpha")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("sortAlpha")!.style.color = DarkGrey.text;
      document.getElementById("sortCreate")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("sortCreate")!.style.color = DarkGrey.text;
      document.getElementById("albumModifier")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("albumModifier")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("createAlbum")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("createAlbum")!.style.color = DeepPurple.text;
      document.getElementById("menuCompte")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("menuCompte")!.style.color = DeepPurple.text;
      document.getElementById("chatRoom")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("chatRoom")!.style.color = DeepPurple.text;
      document.getElementById("title3")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title3")!.style.color = DeepPurple.text;
      document.getElementById("sortAlpha")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("sortAlpha")!.style.color = DeepPurple.text;
      document.getElementById("sortCreate")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("sortCreate")!.style.color = DeepPurple.text;
      document.getElementById("albumModifier")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("albumModifier")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("createAlbum")!.style.backgroundColor = LightBlue.main;
      document.getElementById("createAlbum")!.style.color = LightBlue.text;
      document.getElementById("menuCompte")!.style.backgroundColor = LightBlue.main;
      document.getElementById("menuCompte")!.style.color = LightBlue.text;
      document.getElementById("chatRoom")!.style.backgroundColor = LightBlue.main;
      document.getElementById("chatRoom")!.style.color = LightBlue.text;
      document.getElementById("title3")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title3")!.style.color = LightBlue.text;
      document.getElementById("sortAlpha")!.style.backgroundColor = LightBlue.main;
      document.getElementById("sortAlpha")!.style.color = LightBlue.text;
      document.getElementById("sortCreate")!.style.backgroundColor = LightBlue.main;
      document.getElementById("sortCreate")!.style.color = LightBlue.text;
      document.getElementById("albumModifier")!.style.backgroundColor = LightBlue.main;
      document.getElementById("albumModifier")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("createAlbum")!.style.backgroundColor = LightPink.main;
      document.getElementById("createAlbum")!.style.color = LightPink.text;
      document.getElementById("menuCompte")!.style.backgroundColor = LightPink.main;
      document.getElementById("menuCompte")!.style.color = LightPink.text;
      document.getElementById("chatRoom")!.style.backgroundColor = LightPink.main;
      document.getElementById("chatRoom")!.style.color = LightPink.text;
      document.getElementById("title3")!.style.backgroundColor = LightPink.main;
      document.getElementById("title3")!.style.color = LightPink.text;
      document.getElementById("sortAlpha")!.style.backgroundColor = LightPink.main;
      document.getElementById("sortAlpha")!.style.color = LightPink.text;
      document.getElementById("sortCreate")!.style.backgroundColor = LightPink.main;
      document.getElementById("sortCreate")!.style.color = LightPink.text;
      document.getElementById("albumModifier")!.style.backgroundColor = LightPink.main;
      document.getElementById("albumModifier")!.style.color = LightPink.text;
    }
  }

  roomListener() {
    this.socketService.getSocket().on("ALBUMCREATED", (data) => {
      this.getAllAlbums();
    });

    this.socketService.getSocket().on("ALBUMDELETED", (data) => {
      this.getAllAlbums();
    });

    this.socketService.getSocket().on("ALBUMNAMECHANGED", (data) => {
      data=JSON.parse(data);
      this.getAllAlbums();
    });

    this.socketService.getSocket().on("ALBUMMODIFIED", (data) => {
      data=JSON.parse(data);
      console.log(data.album.requests);
      if(data.album.requests.length > 0) {
        if(data.album.members.includes(this.socketService.email)) {
          this.dialog.open(AcceptRequestComponent);
          this.socketService.memberRequest = data.album.requests[0];
          this.socketService.albumName = data.album.albumName;
        }
      }
      this.getAllAlbums();
    });

    this.socketService.getSocket().on("REQUESTACCEPT",(data)=>{
      data=JSON.parse(data);
      if(data.member==this.socketService.userObj.useremail) {
        this.snackBar.open(this.alert, '', { duration: ONE_SECOND, });
        //alert("request accepted");
      }
    });
  }

  son(): void {
    this.playAudio("ui2.wav");
  }

  getAllAlbums() {
    let link = this.BASE_URL + "album/getAlbums";
    this.http.get<any>(link).subscribe((data: any) => {
      this.albumTempSerivce.albums.clear();
      let length = Object.keys(data).length;
      this.numberOfAlbums = length;
      this.AlbumsNames = [];
      this.AlbumsVisibilite = [];
      this.AlbumsCreationDate = [];
      data.forEach((albums:any)=>{
        let albumObj:Album = new Album(albums as AlbumInterface);
        this.albumTempSerivce.albums.set(albumObj.getName() as string, albumObj);
        this.AlbumsNames.push(albums.albumName);
        this.AlbumsVisibilite.push(albums.visibility);
        this.AlbumsCreationDate.push(albums.dateCreation);
      });

      this.AlbumsNames.sort(function(x,y){ return x == "PUBLIC" ? -1 : y == "PUBLIC" ? 1 : 0; });

      if(this.kk) {
        this.AlbumsNames = [];
        for(let i = 0; i < this.order.length; i++) {
          data.forEach((albums:any)=>{
            let albumObj:Album = new Album(albums as AlbumInterface);
            this.albumTempSerivce.albums.set(albumObj.getName() as string, albumObj);
            if(this.order[i] == albums.dateCreation) {
              this.AlbumsNames.push(albums.albumName);
            }
          });
          this.AlbumsNames.sort(function(x,y){ return x == "PUBLIC" ? -1 : y == "PUBLIC" ? 1 : 0; });
        }
        this.kk = false;
      }
    });
  }

  sortAlpha() {
    if(this.toggleSortAlpha) {
      this.playAudio("ui2.wav");
      this.AlbumsNames.sort();
      this.AlbumsNames.sort(function(x,y){ return x == "PUBLIC" ? -1 : y == "PUBLIC" ? 1 : 0; });
      this.snackBar.open(this.filteredAlphaAsc, '', { duration: ONE_SECOND, });
      this.toggleSortAlpha = false;
    }
    else {
      this.playAudio("ui2.wav");
      this.AlbumsNames.sort().reverse();
      this.AlbumsNames.sort(function(x,y){ return x == "PUBLIC" ? -1 : y == "PUBLIC" ? 1 : 0; });
      this.snackBar.open(this.filteredAlphaDes, '', { duration: ONE_SECOND, });
      this.toggleSortAlpha = true;
    }
  }

  sortCreation() {
    if(this.toggleSortCreation) {
      this.playAudio("ui2.wav");
      this.order = this.AlbumsCreationDate.sort();
      this.kk = true;
      this.getAllAlbums();
      this.snackBar.open(this.filteredDateAsc, '', { duration: ONE_SECOND, });
      this.toggleSortCreation = false;
    }
    else {
      this.playAudio("ui2.wav");
      this.order = this.AlbumsCreationDate.sort().reverse();
      this.kk = true;
      this.getAllAlbums();
      this.snackBar.open(this.filteredDateDesc, '', { duration: ONE_SECOND, });

      this.toggleSortCreation = true;
    }
  }

  createAlbum() {
    this.dialog.open(NewAlbumComponent, { disableClose: false, height: "390px", width: "450px" });
    this.playAudio("ui2.wav")
  }

  defaultRoom() {
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
      }
    });
  }


  openAlbum(element: any) {
    let link = this.BASE_URL + "album/joinAlbum";
    let link2 = this.BASE_URL + "album/addRequest";

    console.log(this.albumTempSerivce.albums.get(element.textContent.trim().slice(7))!.getMembers());
    if(this.albumTempSerivce.albums.get(element.textContent.trim().slice(7))!.getMembers().includes(this.socketService.email)) {
      this.http.post<any>(link, {albumName: element.textContent.trim().slice(7), useremail: this.socketService.email}).subscribe((data:any) => { 
        if(data.message == "success") {
          this.router.navigate(['/', 'dessins']);
          this.playAudio("ui2.wav");
          this.socketService.albumName = element.textContent.trim().slice(7);
          console.log("album name", this.socketService.albumName);
        }
      });
    }
    else {
      // REQUEST JOIN ALBUM
      this.http.post<any>(link2, {newMember: this.socketService.email, albumName: element.textContent.trim().slice(7)}).subscribe((data:any) => { 
        if(data.message == "success") {
          console.log("REQUESTED");
          this.playAudio("email.wav");
          this.snackBar.open(this.request, '', { duration: ONE_SECOND, });
        }
      });
    }

  }

  quitAlbum(element: any) {
    let link = this.BASE_URL + "album/leaveAlbum";

    if(!this.albumTempSerivce.albums.get(element.textContent.trim().slice(8))!.getMembers().includes(this.socketService.email)) {
      this.playAudio("error.wav");
      this.snackBar.open(this.notmember, '', { duration: ONE_SECOND, });
    }
    else if (this.albumTempSerivce.albums.get(element.textContent.trim().slice(8))!.getCreator() == this.socketService.email) {
      this.playAudio("error.wav");
      this.snackBar.open(this.iscreator, '', { duration: ONE_SECOND, });
    }
    else if (this.albumTempSerivce.albums.get(element.textContent.trim().slice(8))!.getVisibility() == "public") {
      this.playAudio("error.wav");
      this.snackBar.open(this.leavePublicAlbum, '', { duration: ONE_SECOND, });
    }
    else {
      this.http.post<any>(link, {albumName: element.textContent.trim().slice(8), member: this.socketService.email}).subscribe((data:any) => { 
        if(data.message == "success") {
          console.log("quit");
          this.playAudio("ui2.wav");
          this.snackBar.open(this.leftAlbum, '', { duration: ONE_SECOND, });
        }
      });
    }

  }


  deleteAlbum(element: any) : void {
    let link = this.BASE_URL + "album/deleteAlbum";
    let link2 = this.BASE_URL + "album/getDrawings/" + element.textContent.trim().slice(10);
    let link3 = this.BASE_URL + "drawing/deleteDrawing";
    
    if(this.socketService.email == this.albumTempSerivce.albums.get(element.textContent.trim().slice(10))!.getCreator()) {
      this.http.post<any>(link, {albumName: element.textContent.trim().slice(10), useremail: this.socketService.email}).subscribe((data:any) => {
        if(data.message == "success") {
          this.playAudio("bin.wav");
          console.log("ALBUM DELETED");
          this.http.get<any>(link2, {}).subscribe((data:any) => {
            let length = Object.keys(data).length;
            console.log("pp size", length);
            for (let i = 0; i < length; i++) {
              this.http.post<any>(link3, {drawingName: data[i].drawingName }).subscribe((data:any) => {
                console.log("i", data[i].drawingName);
              });
            }
          });
        }
      });
    }
    else {
      this.playAudio("error.wav");
      this.snackBar.open(this.notcreator, '', { duration: ONE_SECOND, });
    }
  }  

  modifyAlbum(element: any) { 
    if(this.socketService.email == this.albumTempSerivce.albums.get(element.textContent.trim().slice(11))!.getCreator()) {
      this.dialog.open(ModifyAlbumComponent);
      this.playAudio("ui1.wav");
      console.log(element.textContent);
      this.socketService.albumName = element.textContent.trim().slice(11);
    }
    else {
      this.playAudio("error.wav");
      this.snackBar.open(this.notcreator, '', { duration: ONE_SECOND, });
    }
  }

  playAudio(title: string){
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  logout() {
    /*let link = this.BASE_URL + "user/logoutUser";
    this.playAudio("ui1.wav");
    this.socketService.disconnectSocket();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });*/
    this.dialog.open(LogoutComponent);

  }

}
