import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { DrawingTempService } from '@app/services/drawingTemp.service';
import { Drawing } from '@app/classes/Drawing';
import { DrawingInterface } from '@app/interfaces/DrawingInterface';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
import { French, English } from '@app/interfaces/Langues';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { CreateCanalComponent } from '../create-canal/create-canal.component';
import { FilterCanalComponent } from '../filter-canal/filter-canal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

const ONE_SECOND = 1000;

@Component({ 
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})

export class RoomsComponent implements OnInit {
  @ViewChild('roomname') input: any;
  @ViewChild('roomfilter') search: any;
  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  private readonly BASE_URL=URL;
  public list = new Array<string>(); 
  public numberOfRooms: number ;
  public buttonsTexts:Array<string> = [];
  public drawingNames:Array<string> = [];
  public bool: boolean = true;
  //public buttonsTexts:Array<string> = ['DEFAULT'];

  public creaRoom: string;
  public finRoom: string;
  public nameOfNewRoom: string;
  public nameOfRoomCreator: string;
  public roomTitle: string;
  public join2: string;
  public delete: string;
  public leave2: string;
  public quit: string;
  public alreadyleave: string;
  public default: string;
  private members: Array<string> = [];

  constructor(
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
    public drawingTempSerivce: DrawingTempService,
    public pencilToolService: PencilToolService,
    public toolEllipseService: ToolEllipseService,
    public toolRectangleService: ToolRectangleService,
    private snackBar: MatSnackBar,
  ) { 
    this.hotkeyService.hotkeysListener();
  }

  ngOnInit(): void {
    if(this.socketService.language == "french") {
      this.creaRoom = French.createRoom;
      this.finRoom = French.findRoom;
      this.nameOfNewRoom = French.nameOfNewRoom;
      this.nameOfRoomCreator = French.nameOfRoomCreator;
      this.roomTitle = French.changeRoom;
      this.join2 = French.join2;
      this.delete = French.delete;
      this.leave2 = French.leave2;
      this.quit = French.quit;
      this.alreadyleave = French.alreadyleave;
      this.default = French.default;
    }
    else {
      this.creaRoom = English.createRoom;
      this.finRoom = English.findRoom;
      this.nameOfNewRoom = English.nameOfNewRoom;
      this.nameOfRoomCreator = English.nameOfRoomCreator;
      this.roomTitle = English.changeRoom;
      this.join2 = English.join2;
      this.delete = English.delete;
      this.leave2 = English.leave2;
      this.quit = English.quit;
      this.alreadyleave = English.alreadyleave;
      this.default = English.default;
    }
    if(this.socketService.theme == "light grey"){
      document.getElementById("CreerCanal")!.style.backgroundColor = LightGrey.main;
      document.getElementById("CreerCanal")!.style.color = LightGrey.text;
      document.getElementById("searchRoom")!.style.backgroundColor = LightGrey.main;
      document.getElementById("searchRoom")!.style.color = LightGrey.text;
      document.getElementById("title7")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title7")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("CreerCanal")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("CreerCanal")!.style.color = DarkGrey.text;
      document.getElementById("searchRoom")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("searchRoom")!.style.color = DarkGrey.text;
      document.getElementById("title7")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title7")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("CreerCanal")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("CreerCanal")!.style.color = DeepPurple.text;
      document.getElementById("searchRoom")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("searchRoom")!.style.color = DeepPurple.text;
      document.getElementById("title7")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title7")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("CreerCanal")!.style.backgroundColor = LightBlue.main;
      document.getElementById("CreerCanal")!.style.color = LightBlue.text;
      document.getElementById("searchRoom")!.style.backgroundColor = LightBlue.main;
      document.getElementById("searchRoom")!.style.color = LightBlue.text;
      document.getElementById("title7")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title7")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("CreerCanal")!.style.backgroundColor = LightPink.main;
      document.getElementById("CreerCanal")!.style.color = LightPink.text;
      document.getElementById("searchRoom")!.style.backgroundColor = LightPink.main;
      document.getElementById("searchRoom")!.style.color = LightPink.text;
      document.getElementById("title7")!.style.backgroundColor = LightPink.main;
      document.getElementById("title7")!.style.color = LightPink.text;
    }

    this.getAllDrawings();

    // let link = this.BASE_URL+"room/getAllRooms";
    // this.http.get<any>(link).subscribe((data: any) => {
    //   console.log("update 2");
    //   let length = Object.keys(data).length;
    //   this.numberOfRooms = length;
    //   for(var i = 0; i < length; i++) { 
    //     //this.list.push(data[i].roomName);
    //     // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
    //     console.log("TEMP", this.drawingTempSerivce.drawings);
    //     console.log("DATA ROOMNAME", data[i].roomName);
    //     if(!this.drawingTempSerivce.drawings.has(data[i].roomName)) {
    //       this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
    //     }
    //     else {
    //       console.log("A");
    //     }
    //   }
    // });

    this.roomListener();
    // this.getAllDrawings();
    this.redirect();
  }

  redirect() {
    this.bool = true;
    let link2 = this.BASE_URL+"room/getAllRooms";
    this.socketService.getSocket().on("ROOMDELETED",(data)=>{
      data=JSON.parse(data);
      this.http.get<any>(link2).subscribe((data: any) => {
        let length = Object.keys(data).length;
        this.numberOfRooms = length;

        if(this.bool) {
          // pour redirect les personnes dans rooms
          for(var i = 0; i <= length; i++) { 
            if(this.router.url == "/clavardage" || this.router.url == "/sidenav") {
              if(this.socketService.currentRoom != data[i].roomName) {
                this.router.navigate(['/', 'rooms']);
              }
              else if(this.drawingTempSerivce.drawings.has(this.socketService.currentRoom)) { 
                this.router.navigate(['/', 'sidenav']);
                break;
              }
              else if (this.socketService.currentRoom == data[i].roomName) {
                this.router.navigate(['/', 'clavardage']);
                break;
              }
            }
          }
        }
      });
    });
  }

  son(): void {
    this.playAudio("ui2.wav");
  }

  roomListener() {
    // let link2 = this.BASE_URL+"room/getAllRooms";
    this.socketService.getSocket().on("ROOMDELETED",(data)=>{
      data=JSON.parse(data);
      // this.buttonsTexts = [];
      // this.http.get<any>(link2).subscribe((data: any) => {
      //   let length = Object.keys(data).length;
      //   this.numberOfRooms = length;        
      //   // pour update les rooms buttons
      //   for(var i = 0; i <= length; i++) { 
      //     if(!this.drawingTempSerivce.drawings.has(data[i].roomName)) {
      //       this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
      //     }
      //   }
      //   console.log("update 1");
      // });
      this.getAllDrawings();
    });

    this.socketService.getSocket().on("CREATEROOM",(data)=>{
      data=JSON.parse(data);
      // this.buttonsTexts = [];
      // this.http.get<any>(link2).subscribe((data: any) => {
      //   let length = Object.keys(data).length;
      //   this.numberOfRooms = length;
      //   for(var i = 0; i <= length; i++) { 
      //     if(!this.drawingTempSerivce.drawings.has(data[i].roomName)) {
      //       this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
      //     }
      //   }
      // });
      // this.input.nativeElement.value = ' ';
      this.getAllDrawings();
     });

  }

  getAllDrawings() {
    let link = this.BASE_URL + "drawing/getAllDrawings";  
    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      data.forEach((drawing:any)=>{
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
      });
      let link = this.BASE_URL+"room/getAllRooms";
      this.http.get<any>(link).subscribe((data: any) => {
        console.log("update 2");
        let length = Object.keys(data).length;
        this.numberOfRooms = length;
        this.buttonsTexts = [];
        for(var i = 0; i < length; i++) { 
          //this.list.push(data[i].roomName);
          // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
          console.log("TEMP", this.drawingTempSerivce.drawings);
          console.log("DATA ROOMNAME", data[i].roomName);
          if(!this.drawingTempSerivce.drawings.has(data[i].roomName)) {
            this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
          }
          else {
            console.log("A");
          }
        }
      });
    });
  } 

  room: string;

  changeRoom(element: any): void { 
    this.socketService.joinRoom(element.textContent.trim().slice(8));
    this.socketService.currentRoom = element.textContent.trim().slice(8);
    console.log("LOOOK ATTT MEEEE" + element.textContent.trim().slice(8));
    
 
    this.router.navigate(['/', 'clavardage']);


    // // Pour savoir si la salle doit avoir un canvas ou non
    // if(this.drawingTempSerivce.drawings.has(element.textContent.trim().slice(8))) {   
    //   this.router.navigate(['/', 'sidenav']);
    //   this.dialog.open(NewDrawingComponent);
    // }
    // else {
    //   this.router.navigate(['/', 'clavardage']);
    // }

    if(this.drawingTempSerivce.drawings.has(element.textContent.trim().slice(8))) {   
      let link = this.BASE_URL + "drawing/joinDrawing";

      this.http.post<any>(link, {useremail: this.socketService.email, drawingName: this.socketService.drawingName}).subscribe((data:any) => {
        if(data.message == "success") {
          console.log("join dessins:" + element.textContent.trim().slice(8));
          this.router.navigate(['/', 'sidenav']);
          this.dialog.open(NewDrawingComponent);
        }
      });
  }

    // Route JoinRoom
    let link2 = this.BASE_URL + "room/joinRoom";

    const userObj={
      useremail:this.socketService.email,
      nickname:this.socketService.nickname,
    }

    this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {
  
      if(data.message == "success") {
        this.socketService.currentRoom = element.textContent.trim().slice(8);
        let link3 = this.BASE_URL+"room/getAllRooms";
      this.http.get<any>(link3).subscribe((data: any) => {;
        let length = Object.keys(data).length;
        for(var i = 0; i < length; i++) { 
          if(data[i].roomName == element.textContent.trim().slice(8)) {
            this.socketService.members = data[i].members;
            this.socketService.members = this.socketService.members.filter((el, i, a) => i === a.indexOf(el));
            console.log("members", this.socketService.members);
          }
        }
      });
      }
    });

  } 

  deleteRoom(element: any): void {
    this.bool = false;
    this.socketService.roomDeleted(element.textContent.trim().slice(10));
    let link = this.BASE_URL + "room/deleteRoom";
    let link2 = this.BASE_URL + "drawing/deleteDrawing";

    // si c'est un drawing room
    if (element.textContent.trim().slice(10) == "DEFAULT") {
      this.snackBar.open(this.default, '', { duration: ONE_SECOND, });
      this.playAudio("error.wav");
    }
    if(this.drawingTempSerivce.drawings.has(element.textContent.trim().slice(10))) {
      this.http.post<any>(link2, {drawingName: element.textContent.trim().slice(10)}).subscribe((data:any) => {
        if (data.message == "success") {
          console.log("TESTING" + data);
          console.log("PIPI");
          console.log("ICITE", this.socketService.currentRoom);
          this.playAudio("bin.wav");
        }
      });
    }
    else { // si c'est un PAS drawing room
      if (element.textContent.trim().slice(10) == "DEFAULT") {
        this.snackBar.open(this.default, '', { duration: ONE_SECOND, });
        this.playAudio("error.wav");
      }
      this.http.post<any>(link,{roomName: element.textContent.trim().slice(10) }).subscribe((data: any) => { 
        console.log(data);
        if (data == 404) {
          console.log("edwin" + data);
        }
        if (data.message == "success") {
          console.log("look at me " + data.message);
          this.socketService.currentRoom = "randomSHIT"; //IMPORTANT NE PAS ENLEVER
          this.playAudio("bin.wav");
        }
      });
    }
  }

  find(text: string) {
    let link = this.BASE_URL+"room/getAllRooms";
    this.http.get<any>(link).subscribe((data: any) => {
      let length = Object.keys(data).length;
      this.numberOfRooms = length;
      console.log(text);
      this.buttonsTexts = [];
      for(var i = 1; i <= length; i++) { 
        console.log(data[i].roomName);
        if (data[i].roomName == text.trim() || data[i].creator == text.trim()) {
          console.log("GOT IN!");
          // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
          if(!this.drawingTempSerivce.drawings.has(data[i].roomName)) {
            this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}`];
          }
        }
      }
    });
  }

  create(text: string) {
    let link = this.BASE_URL+"room/createRoom";
    let link2 = this.BASE_URL+"room/getAllRooms";

    /*
    this.socketService.getSocket().on("CREATEROOM",(data)=>{
       data=JSON.parse(data);
       this.http.get<any>(link2).subscribe((data: any) => {
        let length = Object.keys(data).length; 
        //this.list.push(data[length-1].roomName);
        // this.buttonsTexts = [...this.buttonsTexts, `${data[length-1].roomName}, (par ${data[length-1].creator})`];
        text = text.trim();
        this.buttonsTexts = [...this.buttonsTexts, text.trim()];
        console.log("REGARDE MOI" + text.trim());
        for(var i = 0; i < length; i++) { 
          console.log(data[i].roomName);
        }
      });
      this.input.nativeElement.value = ' ';
      
    });*/

    text.trim();
    if (text.trim() != '') {
      this.http.get<any>(link2).subscribe((data: any) => {
        
            document.getElementById("error")!.style.visibility= "hidden";
            this.http.post<any>(link, { roomName: this.room.trim(), creator: this.socketService.email }).subscribe((data: any) => {
              if (data.message == "success") {
                console.log(data.message);
              }
            },(error:HttpErrorResponse)=>{
              console.error(error);
              console.log(error.status);
              console.log(error.error.message);
              if( error.error.message == "404 (Not Found)" || data == 404 || error.error.message == "Http failure response for "+this.BASE_URL+"/room/createRoom: 404 Not Found" || error.error.message == "failed") {
                document.getElementById("error")!.style.visibility = "visible";
                document.getElementById("error")!.innerHTML = "La salle " + text.trim() + " existe déjà";
              }
            }
            );
      });
    }


    if (text.trim().length == 0) {
      this.input.nativeElement.value = ' ';
    }
    if (text.trim() == "" || text.trim() == null) {
      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = "Vous ne pouvez pas mettre des champs vides";
    }
    
    this.input.nativeElement.focus();
  }


  quitRoom(element: any): void {
    let link = this.BASE_URL + "room/leaveRoom";
    this.playAudio("ui2.wav");

    //SI DRAWING ROOM
    if(this.drawingTempSerivce.drawings.has(element.textContent.trim().slice(8))) {
      console.log("dessin room");
      //this.snackBar.open(this.leave2 + element.textContent.trim().slice(8) , '', { duration: ONE_SECOND, });
    }
    else {

      //ROOM NORMAL
      let link2 = this.BASE_URL+"room/getAllRooms";
      this.http.get<any>(link2).subscribe((data: any) => {;
        let length = Object.keys(data).length;
        for(var i = 0; i < length; i++) { 
          if(data[i].roomName == element.textContent.trim().slice(8)) {
            this.socketService.members = data[i].members;
            this.socketService.members = this.socketService.members.filter((el, i, a) => i === a.indexOf(el));
            console.log("data", this.socketService.members);
            if (this.members.includes(this.socketService.email)) {
              this.http.post<any>(link,{ useremail: this.socketService.email ,roomName: element.textContent.trim().slice(8) }).subscribe((data: any) => { 
                if (data.message == "success") {
                  console.log("succ");
                  this.snackBar.open(this.leave2 + element.textContent.trim().slice(8) , '', { duration: ONE_SECOND, });
                }
              });
            }
            else {
              this.snackBar.open(this.alreadyleave + element.textContent.trim().slice(8) , '', { duration: ONE_SECOND, });
            }
          }
        }
      });
    }
  }

  
  cancel() {
    this.router.navigate(['/', 'sidenav']);
  }

  createCanal() {
    this.dialog.open(CreateCanalComponent, { disableClose: false, height: "350px", width: "450px" } );
    this.playAudio("ui2.wav");
  }

  filterCanal() {
    this.dialog.open(FilterCanalComponent);
  }


  playAudio(title: string) {
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  logout() {
    let link = this.BASE_URL + "user/logoutUser";

    this.playAudio("ui1.wav");
    this.socketService.disconnectSocket();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });
  }
}
