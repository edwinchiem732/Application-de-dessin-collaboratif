import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { Drawing } from '@app/classes/Drawing';
import { DrawingInterface } from '@app/interfaces/DrawingInterface';
import { DrawingTempService } from '@app/services/drawingTemp.service';
// import { BaseShapeInterface } from '@app/interfaces/BaseShapeInterface';
// import { checkLine } from '@app/interfaces/LineInterface';
import { PencilToolService } from '@app/services/tools/pencil-tool/pencil-tool.service';
import { ToolEllipseService } from '@app/services/tools/tool-ellipse/tool-ellipse.service';
import { ToolRectangleService } from '@app/services/tools/tool-rectangle/tool-rectangle.service';
// import { checkEllipse } from '@app/interfaces/EllipseInterface';
// import { checkRectangle } from '@app/interfaces/RectangleInterface';
import { FilledShape } from '@app/services/tools/tool-rectangle/filed-shape.model';
// import { DrawingService } from '@app/services/drawing/drawing.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { Point } from 'src/app/model/point.model';
import { Pencil } from '@app/services/tools/pencil-tool/pencil.model';
import { French, English } from '@app/interfaces/Langues';
import { ModifyDrawingComponent } from '../modify-drawing/modify-drawing.component';
import { URL } from '../../../../constants';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateDrawingComponent } from '../create-drawing/create-drawing.component';
import { EnterPasswordComponent } from '../enter-password/enter-password.component';
import { LogoutComponent } from '../logout/logout.component';


const ONE_SECOND = 1000;
@Component({
  selector: 'app-dessins',
  templateUrl: './dessins.component.html',
  styleUrls: ['./dessins.component.scss']
})
export class DessinsComponent implements OnInit {

  private readonly BASE_URL: string = URL;
  
  imageUrlArray: string[] = [];
  public names:Array<string> = [];
  public owners:Array<string> = [];
  public visibite:Array<string> = [];
  public nbrMembres:Array<number> = [];
  public creationDate:Array<string> = [];
  public nbrLiked:Array<number> = [];
  public peopleLiked:Array<string> = [];
  public centerImage: number = 0;
  public leftImage: number = this.imageUrlArray.length - 1;
  public rightImage: number = 1;
  public bool: boolean = true;
  public numberOfDrawings: number;

  renderer: Renderer2;
  parameters: FormGroup;
  private strokeWidth: FormControl;
  private rectStyle: FormControl;
  public pencil: Pencil | null;
  public rectangleAttributes: FilledShape;

  public drawingTitle: string;
  public drawingInput: string;
  public creaDrawing: string;
  public drawName: string;
  public numberOfPeople: string;
  public own: string;
  public visib: string;
  public open: string;
  public delete: string;
  public datecrea: string;
  public lik: string;
  public prop: string;
  public findDraw2: string;
  public placeHolderFindDraw: string;

  public cpt = 0;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private socketService: SocketService,
    private http: HttpClient,
    public drawingTempSerivce: DrawingTempService,
    public pencilToolService: PencilToolService,
    public toolEllipseService: ToolEllipseService,
    public toolRectangleService: ToolRectangleService,
    rendererFactory: RendererFactory2,
    private snackBar: MatSnackBar,
    // private drawingService: DrawingService,
  ) { 
    this.renderer = rendererFactory.createRenderer(null, null);
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.rectStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      rectStyle: this.rectStyle,
    });
  }

  ngOnInit(): void {
    this.socketService.he = this.cpt;
    if(this.socketService.language == "french") {
      this.drawingTitle = French.drawingTitle;
      this.drawingInput = French.drawingInput;
      this.creaDrawing = French.createDrawing;
      this.drawName = French.drawingName;
      this.numberOfPeople = French.numberOfPeople;
      this.own = French.owner;
      this.open = French.open;
      this.delete = French.delete;
      this.prop = French.prop;
      this.datecrea = French.datecrea;
      this.lik = French.likes;
      this.findDraw2 = French.findDraw;
      this.placeHolderFindDraw = French.placeHolderFindDraw;
    }
    else {
      this.drawingTitle = English.drawingTitle;
      this.drawingInput = English.drawingInput;
      this.creaDrawing = English.createDrawing;
      this.drawName = English.drawingName;
      this.numberOfPeople = English.numberOfPeople;
      this.own = English.owner;
      this.open = English.open;
      this.delete = English.delete;
      this.prop = English.prop;
      this.datecrea = English.datecrea;
      this.lik = English.likes;
      this.findDraw2 = English.findDraw;
      this.placeHolderFindDraw = English.placeHolderFindDraw
    }
    if(this.socketService.theme == "light grey"){
      document.getElementById("createRoom")!.style.backgroundColor = LightGrey.main;
      document.getElementById("createRoom")!.style.color = LightGrey.text;
      document.getElementById("findDrawButton")!.style.backgroundColor = LightGrey.main;
      document.getElementById("findDrawButton")!.style.color = LightGrey.text;
      document.getElementById("left-arrow")!.style.backgroundColor = LightGrey.main;
      document.getElementById("left-arrow")!.style.color = LightGrey.text;
      document.getElementById("right-arrow")!.style.backgroundColor = LightGrey.main;
      document.getElementById("right-arrow")!.style.color = LightGrey.text;
      document.getElementById("title5")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title5")!.style.color = LightGrey.text;
      document.getElementById("settingsButton")!.style.backgroundColor = LightGrey.main;
      document.getElementById("settingsButton")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("createRoom")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("createRoom")!.style.color = DarkGrey.text;
      document.getElementById("findDrawButton")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("findDrawButton")!.style.color = DarkGrey.text;
      document.getElementById("left-arrow")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("left-arrow")!.style.color = DarkGrey.text;
      document.getElementById("right-arrow")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("right-arrow")!.style.color = DarkGrey.text;
      document.getElementById("title5")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title5")!.style.color = DarkGrey.text;
      document.getElementById("settingsButton")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("settingsButton")!.style.color = DarkGrey.text;
      document.getElementById("albumQuitter")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("albumQuitter")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("createRoom")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("createRoom")!.style.color = DeepPurple.text;
      document.getElementById("findDrawButton")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("findDrawButton")!.style.color = DeepPurple.text;
      document.getElementById("left-arrow")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("left-arrow")!.style.color = DeepPurple.text;
      document.getElementById("right-arrow")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("right-arrow")!.style.color = DeepPurple.text;
      document.getElementById("title5")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title5")!.style.color = DeepPurple.text;
      document.getElementById("settingsButton")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("settingsButton")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("createRoom")!.style.backgroundColor = LightBlue.main;
      document.getElementById("createRoom")!.style.color = LightBlue.text;
      document.getElementById("findDrawButton")!.style.backgroundColor = LightBlue.main;
      document.getElementById("findDrawButton")!.style.color = LightBlue.text;
      document.getElementById("left-arrow")!.style.backgroundColor = LightBlue.main;
      document.getElementById("left-arrow")!.style.color = LightBlue.text;
      document.getElementById("right-arrow")!.style.backgroundColor = LightBlue.main;
      document.getElementById("right-arrow")!.style.color = LightBlue.text;
      document.getElementById("title5")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title5")!.style.color = LightBlue.text;
      document.getElementById("settingsButton")!.style.backgroundColor = LightBlue.main;
      document.getElementById("settingsButton")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("createRoom")!.style.backgroundColor = LightPink.main;
      document.getElementById("createRoom")!.style.color = LightPink.text;
      document.getElementById("findDrawButton")!.style.backgroundColor = LightPink.main;
      document.getElementById("findDrawButton")!.style.color = LightPink.text;
      document.getElementById("left-arrow")!.style.backgroundColor = LightPink.main;
      document.getElementById("left-arrow")!.style.color = LightPink.text;
      document.getElementById("right-arrow")!.style.backgroundColor = LightPink.main;
      document.getElementById("right-arrow")!.style.color = LightPink.text;
      document.getElementById("title5")!.style.backgroundColor = LightPink.main;
      document.getElementById("title5")!.style.color = LightPink.text;
      document.getElementById("settingsButton")!.style.backgroundColor = LightPink.main;
      document.getElementById("settingsButton")!.style.color = LightPink.text;
    }
    
    this.getAllDrawings();
    this.roomListerner();
    this.redirect();
    this.loadImages();
  }

  son(): void {
    this.playAudio("ui2.wav");
  }

  roomListerner() {
    // let link3 = this.BASE_URL + "drawing/getAllDrawings";

    this.socketService.getSocket().on("DRAWINGDELETED", (data) => {
      data = JSON.parse(data);
      console.log("UPDATED?");
      this.getAllDrawings();
      console.log(this.names);
      // console.log("HELLO?????");
      // this.names = [];
      // this.owners = [];
      // this.visibite = [];
      // this.imageUrlArray = [];
      // this.http.get<any>(link3).subscribe((data: any) => { 
      //   data.forEach((drawing:any)=>{
      //     this.imageUrlArray.push("../../../assets/avatar_1.png");
      //     this.names.push(drawing.drawingName); 
      //     this.owners.push(drawing.owner); 
      //     this.visibite.push(drawing.visibility);
      //   });
      // });
    });

    this.socketService.getSocket().on("JOINDRAWING", (data) => {
      data = JSON.parse(data);
      //console.log("JOINED: ", data.drawing.drawingName);
      //console.log("members join: ", data.drawing.members);
      this.getAllDrawings();
    });

    this.socketService.getSocket().on("LEAVEDRAWING", (data) => {
      data = JSON.parse(data);
      //console.log("members left: ", data.drawing.members);
      this.getAllDrawings();
    });

    this.socketService.getSocket().on("DRAWINGCREATED", (data)=> {
      data=JSON.parse(data);

      this.getAllDrawings();
    });

    this.socketService.getSocket().on("VISIBILITYCHANGED", (data) => {
      data=JSON.parse(data);
      this.getAllDrawings();
    });

    this.socketService.getSocket().on("ALBUMMODIFIED", (data) => {
      data=JSON.parse(data);
      this.getAllDrawings();
    });
 
    this.socketService.getSocket().on("ALBUMNAMECHANGED", (data) => {
      data=JSON.parse(data);
      this.getAllDrawings();
    });

    /*this.socketService.getSocket().on("DRAWINGMODIFIED", (data) => {
      data=JSON.parse(data);
      if(data.oldName) {
        this.socketService.drawingNameChange = true;
      }
      this.getAllDrawings();
    });*/

    this.socketService.getSocket().on("ROOMMODIFIED", (data) => {
      data=JSON.parse(data);
      this.getAllDrawings();
    });

    this.socketService.getSocket().on("DRAWINGLIKESCHANGED", (data) => {
      data=JSON.parse(data);
      this.getAllDrawings();
    });

  }


  redirect() {
    this.bool = true;
    let link = this.BASE_URL+ "drawing/getAllDrawings";
    this.socketService.getSocket().on("DRAWINGDELETED",(data)=>{
      data=JSON.parse(data);
      this.http.get<any>(link).subscribe((data: any) => { 

        // data.forEach((drawing:any)=>{
          let length = Object.keys(data).length;
          this.numberOfDrawings = length;
          console.log("this is it my firend: " + this.socketService.currentRoom);
          if(this.bool) {
            // pour redirect les personnes dans rooms
            for(var i = 0; i <= length; i++) { 
              console.log(data[i].drawingName);
              if(this.router.url == "/sidenav" || this.router.url == "/clavardage" ) {
                if(this.socketService.currentRoom != data[i].drawingName) {
                  this.router.navigate(['/', 'rooms']);
                }
                else if (this.socketService.currentRoom == data[i].drawingName) {
                  this.router.navigate(['/', 'sidenav']);
                  break;
                }
              }
            }
          }

      });
    });
  }

  getAllDrawings() {
    console.log("album name", this.socketService.albumName);
    let link = this.BASE_URL + "album/getDrawings/" + this.socketService.albumName;
    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      this.names = [];
      this.owners = [];
      this.visibite = [];
      this.nbrMembres = [];
      this.creationDate = [];
      this.nbrLiked = [];
      this.peopleLiked = [];

      data.forEach((drawing:any)=>{
        this.imageUrlArray.push("../../../assets/color.png");
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        console.log("obj", drawingObj);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
        
        console.log(drawing.drawingName);
        this.names.push(drawing.drawingName); 
        this.owners.push(drawing.owner);
        this.visibite.push(drawing.visibility);
        this.nbrMembres.push(drawing.members.length);
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(drawing.creationDate, 'dd-MM-yyyy HH:mm:ss') as string;
        this.creationDate.push(formattedDate);
        this.nbrLiked.push(drawing.likes.length);
        this.peopleLiked.push(drawing.likes);
      });

    });
  } 

  openDessins(element: any): void { 
    this.socketService.joinRoom(element.textContent.trim().slice(7));
    this.socketService.currentRoom = element.textContent.trim().slice(7);
   
    let link = this.BASE_URL + "drawing/joinDrawing";
  
    this.socketService.clickedDrawing = element.textContent.trim().slice(7);

    if(this.visibite[this.centerImage] == "protected") {
      this.dialog.open(EnterPasswordComponent, { disableClose: false, height: "350px", width: "450px" });
    }
    else {
    this.http.post<any>(link, {useremail: this.socketService.email, drawingName: element.textContent.trim().slice(7)}).subscribe((data:any) => {
      if(data.message == "success") {
        this.dialog.open(NewDrawingComponent);
        this.router.navigate(['/', 'sidenav']);

      let link2 = this.BASE_URL + "room/joinRoom";

        const userObj={
          useremail:this.socketService.email,
          nickname:this.socketService.nickname,
        }
    
        this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
          catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
      
          if(data.message == "success") {
            this.socketService.currentRoom = element.textContent.trim().slice(7);
          }
        });
      }
    });
    }
  }

  find(text: string) {
    this.playAudio("ui2.wav");
    let link = this.BASE_URL + "album/getDrawings/" + this.socketService.albumName;
    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      this.names = [];
      this.owners = [];
      this.visibite = [];
      this.nbrMembres = [];
      this.creationDate = [];
      this.nbrLiked = [];
      this.peopleLiked = [];

      data.forEach((drawing:any)=>{
        console.log("SAD", data.length);
        this.imageUrlArray.push("../../../assets/color.png");
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
        if(drawing.drawingName == text.trim() || drawing.owner == text.trim() || drawing.drawingName.includes(text.trim())) {
          this.names.push(drawing.drawingName); 
          this.owners.push(drawing.owner);
          this.visibite.push(drawing.visibility);
          this.nbrMembres.push(drawing.members.length);
          const datepipe: DatePipe = new DatePipe('en-CA');
          let formattedDate = datepipe.transform(drawing.creationDate, 'dd-MM-yyyy HH:mm:ss') as string;
          this.creationDate.push(formattedDate);
          this.nbrLiked.push(drawing.likes.length);
          this.peopleLiked.push(drawing.likes);
        }
        else if (text.trim() == "") {
          this.names.push(drawing.drawingName); 
          this.owners.push(drawing.owner);
          this.visibite.push(drawing.visibility);
          this.nbrMembres.push(drawing.members.length);
          const datepipe: DatePipe = new DatePipe('en-CA');
          let formattedDate = datepipe.transform(drawing.creationDate, 'dd-MM-yyyy HH:mm:ss') as string;
          this.creationDate.push(formattedDate);
          this.nbrLiked.push(drawing.likes.length);
          this.peopleLiked.push(drawing.likes);
        }
      });
    });
  }

  deleteDessins(element: any): void {
    this.bool = false;
    // if(this.drawingTempSerivce.drawings.has(element.textContent.trim().slice(10))) {
      //console.log("delete dessins:"+ element.textContent.trim().slice(10));
      let link2 = this.BASE_URL + "drawing/deleteDrawing";

      this.playAudio("bin.wav");

      this.http.post<any>(link2, {drawingName: element.textContent.trim().slice(10)}).subscribe((data:any) => {
        if (data.message == "success") {
          //console.log("DELETE DRAWING IS " + data);
        }
      });
    // }
  } 

  openCreate() {
    this.dialog.open(CreateDrawingComponent, { disableClose: true, width: '30%' });
    this.playAudio("ui2.wav");
  }

  drawing: string;

  createDrawing(text: string) {
    let link = this.BASE_URL+"drawing/createDrawing";
    let link5 = this.BASE_URL + "drawing/joinDrawing";
    let link6 = this.BASE_URL + "album/addDrawing";

    this.socketService.getSocket().on("CREATEROOM", (data)=> {
      data=JSON.parse(data);
      //console.log(data.message);
    });

    text.trim();
    if (text.trim() != '') {
      //console.log("cant create");
      this.http.post<any>(link,{drawingName: this.drawing.trim(), owner: this.socketService.email, visibility: "protected", password: "123"}).subscribe((data: any) => { 
        //console.log(data);
        if (data.message == "success") {
          //console.log("CREATE DRAWING: " + data.message);
          this.http.post<any>(link5, {useremail: this.socketService.email, drawingName: this.drawing.trim(), password: "123"}).subscribe((data:any) => {
            if(data.message == "success") {
              this.router.navigate(['/', 'sidenav']);
              this.dialog.open(NewDrawingComponent);
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
          //------------------------------------------------------------
        }
      });
    }
  }

  like(element: any) {
    let link = this.BASE_URL + "drawing/like";
    let link2 = this.BASE_URL + "drawing/removeLike";

    console.log("LMAO", this.socketService.email);
    console.log("DRAWLIKE", this.names[this.centerImage]);
    // console.log(!this.peopleLiked[this.cpt].includes(this.socketService.email));
    console.log("WISS", this.peopleLiked);
    console.log("WISS0", this.peopleLiked[0]);


    if(!this.peopleLiked[this.cpt].includes(this.socketService.email)) {
      this.playAudio("like.wav");
      this.http.post<any>(link,{useremail: this.socketService.email, drawingName: this.names[this.centerImage]}).pipe( 
      //this.http.post<any>(link,{useremail: this.socketService.email, drawingName: element.textContent.trim().slice(2) }).pipe( 
        catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
          console.log("LIKED");
        });
    }
    else {
      console.log("REMOVE", this.socketService.email);
      console.log("REMOVE", this.names[this.centerImage]);
      this.http.post<any>(link2,{useremail: this.socketService.email, drawingName: this.names[this.centerImage]}).pipe( 
        // this.http.post<any>(link2,{useremail: this.socketService.email, drawingName: "}).pipe( 
        catchError(async (err) => console.log("error catched" + err))
        ).subscribe((data: any) => {
          console.log("DISLIKED", data);
        });
    }
  }

  setVisibilityToPrivate(name: string) :  void {
    let link = this.BASE_URL + "drawing/updateDrawing";

    const drawingObj = {
      drawingName: name,
      visibility: "private",
    }

    this.http.post<any>(link,{useremail: this.socketService.email, drawing: drawingObj}).pipe( 
      catchError(async (err) => console.log("error catched" + err))
      ).subscribe((data: any) => {
        // if(data.message == "success") {
        //   console.log("CHANGED VISIBILITY");
        // }
      });
  }

  //, {height: "350px", width: '350px' }
  openSettings(element: any): void {
    if(this.socketService.email == this.owners[this.centerImage]) {
      this.playAudio("ui2.wav");
      this.socketService.isProtected = false;
      this.dialog.open(ModifyDrawingComponent, {width: '380px' });
      this.socketService.drawingName = this.names[this.centerImage];
      this.socketService.currVisib = this.visibite[this.centerImage];
      if(this.visibite[this.centerImage] == "protected") {
        this.socketService.isProtected = true;
      }
    }
    else {
      this.playAudio("error.wav");
      //.log("youre not the owner");
      let erreur= document.getElementById("settingsButton")!;
      erreur.className = "erreuAnimation";
      erreur.classList.remove("erreuAnimation");
      void erreur.offsetWidth;
      erreur.className = "erreuAnimation";
      this.snackBar.open('Vous n\'avez pas le droit de modifier', '', { duration: ONE_SECOND, });

    }

  }



  changeRoom(): void {
    //this.dialog.open(RoomsComponent, { disableClose: true });
    this.router.navigate(['/', 'rooms']);
    this.playAudio("ui2.wav");
    console.log("bing me there");
    // if(this.router.url == "/sidenav") {
    //   this.socketService.drawingName = this.socketService.currentRoom;
    // }

    this.leaveDrawing();
  }

  leaveDrawing() {
    console.log("current", this.socketService.currentRoom);
    // this.socketService.currentRoom = "randomSHIT";
    let link = this.BASE_URL + "drawing/leaveDrawing";

    if(this.router.url == "/sidenav") {
      this.http.post<any>(link,{ useremail: this.socketService.email}).subscribe((data: any) => {
        console.log("response", data);
        if(data.message == "success") {
          console.log("EXITED DRAWING" + data.useremail);
          this.playAudio("ui2.wav");
        }
      });
      // this.router.navigate(['/', 'dessins']);
    }
  }


  // for right button
  rightSideSlide(): void {
    //console.log("names. len", this.names.length);
    if(this.names.length != 1) {
      this.leftImage = this.centerImage;
      this.centerImage = this.rightImage;
      if (this.rightImage >= this.imageUrlArray.length - 1) {
          this.rightImage = 0;
      } else {
          this.rightImage++;
      }
      this.cpt++;
      this.socketService.he = this.cpt;
      this.loadImages();
    }
  }

  // for left button
  leftSideSlide(): void {
    if(this.names.length != 1) {
      this.rightImage = this.centerImage;
      this.centerImage = this.leftImage;
      if (this.leftImage === 0) this.leftImage = this.imageUrlArray.length - 1;
      else {
          this.leftImage--;
      }
      this.cpt--;
      this.socketService.he = this.cpt;
      this.loadImages();
    }

  }

  loadImages(): void {
    if (this.imageUrlArray.length === 1) {
        const mainView = document.getElementById('mainView');
        mainView!.style.background = 'url(' + this.imageUrlArray[this.centerImage] + ')';
    }
    if (this.imageUrlArray.length === 2) {
        const mainView = document.getElementById('mainView');
        mainView!.style.background = 'url(' + this.imageUrlArray[this.centerImage] + ')';

        const rightView = document.getElementById('rightView');
        rightView!.style.background = 'url(' + this.imageUrlArray[this.rightImage] + ')';  
    } 
    else {
        const mainView = document.getElementById('mainView');
        mainView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.centerImage] + ')';

        const leftView = document.getElementById('leftView');
        leftView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.leftImage] + ')';

        const rightView = document.getElementById('rightView');
        rightView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.rightImage] + ')';
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
        //console.log("sayonara");
      }   
    });*/
    this.dialog.open(LogoutComponent);
  }

}
