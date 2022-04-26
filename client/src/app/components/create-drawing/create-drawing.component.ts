import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { URL } from '../../../../constants';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { French, English} from '@app/interfaces/Langues';
import { DrawingTempService } from '@app/services/drawingTemp.service';
import { Drawing } from '@app/classes/Drawing';
import { DrawingInterface } from '@app/interfaces/DrawingInterface';


@Component({
  selector: 'app-create-drawing',
  templateUrl: './create-drawing.component.html',
  styleUrls: ['./create-drawing.component.scss']
})
export class CreateDrawingComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  
  public visibi: string;
  public visibi2: string;
  public names:Array<string>;

  public createDrawingTitle: string;
  public chooseVisi: string;
  public placeHolderCreateDrawing: string;
  public cancelCreationDrawwing: string;
  public createConfirmDrawing: string;
  public priv: string;
  public pub: string;
  public pro: string
  nameOfDrawing: string;
  passLabel: string;
  placeHolderPass: string;
  drawingAleadyExists: string;

  dont: string;

  error1: string;


  constructor(
    public dialogRef: MatDialogRef<CreateDrawingComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
    public drawingTempSerivce: DrawingTempService,
  ) { }

  ngOnInit(): void {
    console.log("HEL", this.socketService.albumName);
    this.dont = this.socketService.albumName;
    let link = this.BASE_URL + "album/getDrawings/" + this.socketService.albumName;
    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      this.names = [];

      data.forEach((drawing:any)=>{
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
        
        this.names.push(drawing.drawingName); 
      });

    });

    if(this.socketService.language == "french") {
      this.createDrawingTitle = French.createDrawingTitle;
      this.chooseVisi = French.chooseVisib;
      this.placeHolderCreateDrawing = French.placeHolderCreateDrawing;
      this.cancelCreationDrawwing = French.cancelCreationDrawwing;
      this.createConfirmDrawing = French.createConfirmDrawing;
      this.nameOfDrawing = French.nameOfDrawing;
      this.passLabel = French.passLabel;
      this.placeHolderPass = French.placeHolderPass;
      this.priv = French.priv;
      this.pub = French.pub;
      this.pro = French.pro;
      this.error1 = French.error1;
      this.drawingAleadyExists = French.drawingAleadyExists;
     }
     else {
       this.createDrawingTitle = English.createDrawingTitle;
       this.chooseVisi = English.chooseVisib;
       this.placeHolderCreateDrawing = English.placeHolderCreateDrawing;
       this.cancelCreationDrawwing = English.cancelCreationDrawwing;
       this.createConfirmDrawing = English.createConfirmDrawing;
       this.nameOfDrawing = English.nameOfDrawing;
       this.passLabel = English.passLabel;
       this.placeHolderPass = English.placeHolderPass;
       this.priv = English.priv;
       this.pub = English.pub;
       this.pro = English.pro;
       this.error1 = English.error1;
       this.drawingAleadyExists = English.drawingAleadyExists;
     }
  }

  chooseVisib(value: any) {
    console.log(value);
    this.visibi = value;
    this.visibi2 = value;
  }

  drawing: string;
  password: string;

  createDrawing(text: string) {
    let link = this.BASE_URL+"drawing/createDrawing";
    let link5 = this.BASE_URL + "drawing/joinDrawing";
    let link6 = this.BASE_URL + "album/addDrawing";

    // console.log(this.drawing.trim());

    this.socketService.getSocket().on("CREATEROOM", (data)=> {
      data=JSON.parse(data);
      //console.log(data.message);
    });

    text.trim();


    if (this.drawing == "" || this.drawing == undefined || this.visibi == undefined) { 
      this.playAudio("error.wav");
      document.getElementById("errorCreateDrawing")!.style.visibility= "visible";
      document.getElementById("errorCreateDrawing")!.innerHTML = this.error1;
      let erreur= document.getElementById("créer")!;
          erreur.className = "erreuAnimation";
          erreur.classList.remove("erreuAnimation");
          void erreur.offsetWidth;
          erreur.className = "erreuAnimation";
    }
    else if (this.drawingTempSerivce.drawings.has(this.drawing)) {
      this.playAudio("error.wav");
      document.getElementById("errorCreateDrawing")!.style.visibility= "visible";
      document.getElementById("errorCreateDrawing")!.innerHTML = this.drawingAleadyExists;
      let erreur= document.getElementById("créer")!;
          erreur.className = "erreuAnimation";
          erreur.classList.remove("erreuAnimation");
          void erreur.offsetWidth;
          erreur.className = "erreuAnimation";
    }
    else {
      //console.log("cant create");
      if (this.visibi == "public") {
        this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "public"}).subscribe((data: any) => { 
          //console.log(data);
          if (data.message == "success") {
            //console.log("CREATE DRAWING: " + data.message);
            this.http.post<any>(link5, {useremail: this.socketService.email, drawingName: this.drawing.trim()}).subscribe((data:any) => {
              if(data.message == "success") {
                this.router.navigate(['/', 'sidenav']);
                this.dialog.open(NewDrawingComponent);
              }
            });
  
            this.http.post<any>(link6, {drawingName: this.drawing.trim(), useremail: this.socketService.email, albumName: "PUBLIC" }).subscribe((data:any) => {
              if (data.message == "success") {
                //console.log("dessin ajoute a album " + this.socketService.albumName);
              }
            });
  
            //------------ Pour join le nouveau room avec le dessin ---------
            this.socketService.joinRoom(this.drawing.trim());
            this.socketService.currentRoom = this.drawing.trim();
            let link2 = this.BASE_URL + "room/joinRoom";
  
            const userObj={
              useremail:this.socketService.email,
              nickname:this.socketService.nickname,
            }
        
            this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
              catchError(async (err) => console.log("error catched" + err))
            ).subscribe((data: any) => {
          
              if(data.message == "success") {
                this.socketService.currentRoom = this.drawing.trim();
                //console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
              }
            });
            this.dialogRef.close();
            //------------------------------------------------------------
          }
        });
      }
      else if (this.visibi == "protected") {
        if(this.password == undefined || this.password == "") {
          this.playAudio("error.wav");
          document.getElementById("errorCreateDrawing")!.style.visibility= "visible";
          document.getElementById("errorCreateDrawing")!.innerHTML = this.error1;
          let erreur= document.getElementById("créer")!;
            erreur.className = "erreuAnimation";
            erreur.classList.remove("erreuAnimation");
            void erreur.offsetWidth;
            erreur.className = "erreuAnimation";
        }
        else {
          this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "protected", password: this.password.trim()}).subscribe((data: any) => { 
            //console.log(data);
            if (data.message == "success") {
              //console.log("CREATE DRAWING: " + data.message);
              this.http.post<any>(link5, { useremail: this.socketService.email, drawingName: this.drawing.trim(), password: this.password.trim()}).subscribe((data:any) => {
                if(data.message == "success") {
                  this.router.navigate(['/', 'sidenav']);
                  this.dialog.open(NewDrawingComponent);
                }
              });
    
              this.http.post<any>(link6, {drawingName: this.drawing.trim(), useremail: this.socketService.email, albumName: "PUBLIC" }).subscribe((data:any) => {
                if (data.message == "success") {
                  //console.log("dessin ajoute a album " + this.socketService.albumName);
                }
              });
    
              //------------ Pour join le nouveau room avec le dessin ---------
              this.socketService.joinRoom(this.drawing.trim());
              this.socketService.currentRoom = this.drawing.trim();
              let link2 = this.BASE_URL + "room/joinRoom";
              
              console.log("HHHH", this.socketService.currentRoom);
  
              const userObj={
                useremail:this.socketService.email,
                nickname:this.socketService.nickname,
              }
          
              this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
                catchError(async (err) => console.log("error catched" + err))
              ).subscribe((data: any) => {
            
                if(data.message == "success") {
                  this.socketService.currentRoom = this.drawing.trim();
                  //console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
                }
              });
              this.dialogRef.close();
              //------------------------------------------------------------
            }
          });
        }
      }
      else if (this.visibi == "private") {
        this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "private"}).subscribe((data: any) => { 
          //console.log(data);
          if (data.message == "success") {
            //console.log("CREATE DRAWING: " + data.message);
            this.http.post<any>(link5, {useremail: this.socketService.email, drawingName: this.drawing.trim()}).subscribe((data:any) => {
              if(data.message == "success") {
                this.router.navigate(['/', 'sidenav']);
                this.dialog.open(NewDrawingComponent);
                this.playAudio("ui2.wav");
              }
            });
  
            this.http.post<any>(link6, {drawingName: this.drawing.trim(), useremail: this.socketService.email, albumName: this.socketService.albumName }).subscribe((data:any) => {
              if (data.message == "success") {
                //console.log("dessin ajoute a album " + this.socketService.albumName);
              }
            });
  
            //------------ Pour join le nouveau room avec le dessin ---------
            this.socketService.joinRoom(this.drawing.trim());
            this.socketService.currentRoom = this.drawing.trim();
            let link2 = this.BASE_URL + "room/joinRoom";
  
            const userObj={
              useremail:this.socketService.email,
              nickname:this.socketService.nickname,
            }
        
            this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
              catchError(async (err) => console.log("error catched" + err))
            ).subscribe((data: any) => {
          
              if(data.message == "success") {
                this.socketService.currentRoom = this.drawing.trim();
                //console.log("REGARDE MOI BIG:" + this.socketService.currentRoom);
              }
            });
            this.dialogRef.close();
            //------------------------------------------------------------
          }
        });
      }
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


  cancelCreate() {
    this.dialogRef.close();
    this.playAudio("ui2.wav");
  }

}
