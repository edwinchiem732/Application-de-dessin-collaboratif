import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { URL } from '../../../../constants';
import { Router } from '@angular/router';
import { French, English} from '@app/interfaces/Langues';


@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.component.html',
  styleUrls: ['./enter-password.component.scss']
})
export class EnterPasswordComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  passTitle: string;
  cancelMotPass: string;
  openMotPass: string;
  passTit: string;
  errorPass: string;
  error1: string;
  notGoodPass: string;

  constructor(
    public dialogRef: MatDialogRef<EnterPasswordComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    public dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if(this.socketService.language == "french") {
      this.passTit = French.passTit;
      this.passTitle = French.passTitle;
      this.cancelMotPass = French.cancelMotPass;
      this.openMotPass = French.openMotPass;
      this.error1 = French.error1;
      this.notGoodPass = French.notGoodPass;
     }
     else {
       this.passTit = English.passTit;
       this.passTitle = English.passTitle;
       this.cancelMotPass = English.cancelMotPass;
       this.openMotPass = English.openMotPass;
       this.error1 = English.error1;
       this.notGoodPass = English.notGoodPass;
     }
  }

  password2: string;

  enterPassword() {

    let link = this.BASE_URL + "drawing/joinDrawing";

    if(this.password2 == undefined || this.password2 == "" ) {
      console.log("nope");
      this.playAudio("error.wav");
      document.getElementById("errorPass")!.style.visibility= "visible";
      document.getElementById("errorPass")!.innerHTML = this.error1;
    }
    else {




      this.http.post<any>(link, {useremail: this.socketService.email, drawingName: this.socketService.clickedDrawing, password: this.password2.trim()}).subscribe((data: any) => {
        if (data.message == "success") {
          if(data.message == "success") {
            //console.log("CA MARCHE OPEN");
            //console.log("join dessins:" + element.textContent.trim().slice(7));
            this.dialog.open(NewDrawingComponent);
            this.router.navigate(['/', 'sidenav']);
            //console.log("CREATED CANVAS");
            this.dialogRef.close();
          let link2 = this.BASE_URL + "room/joinRoom";
    
            const userObj={
              useremail:this.socketService.email,
              nickname:this.socketService.nickname,
            }
        
            this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
              catchError(async (err) => console.log("error catched" + err))
            ).subscribe((data: any) => {
          
              if(data.message == "success") {
                this.socketService.currentRoom = this.socketService.clickedDrawing;
                //console.log("current room;" + this.socketService.currentRoom);
              }
            });
          }
        }
      },(error:HttpErrorResponse)=>{
        console.error(error);
        console.log(error.status);
        console.log(error.error.message);
        if( error.error.message == "password does not match" ) {
          this.playAudio("error.wav");
          document.getElementById("errorPass")!.style.visibility= "visible";
          document.getElementById("errorPass")!.innerHTML = this.notGoodPass;
        }
      }
      );
    }





    //   this.http.post<any>(link, {useremail: this.socketService.email, drawingName: this.socketService.clickedDrawing, password: this.password2.trim()}).subscribe((data:any) => {
    //     if(data.message == "success") {
    //       //console.log("CA MARCHE OPEN");
    //       //console.log("join dessins:" + element.textContent.trim().slice(7));
    //       this.dialog.open(NewDrawingComponent);
    //       this.router.navigate(['/', 'sidenav']);
    //       //console.log("CREATED CANVAS");
  
    //     let link2 = this.BASE_URL + "room/joinRoom";
  
    //       const userObj={
    //         useremail:this.socketService.email,
    //         nickname:this.socketService.nickname,
    //       }
      
    //       this.http.post<any>(link2,{ newRoomName:this.socketService.currentRoom, user:userObj}).pipe(
    //         catchError(async (err) => console.log("error catched" + err))
    //       ).subscribe((data: any) => {
        
    //         if(data.message == "success") {
    //           this.socketService.currentRoom = this.socketService.clickedDrawing;
    //           //console.log("current room;" + this.socketService.currentRoom);
    //         }
    //       });
    //     }
    //   });
    //   this.dialogRef.close();
    // }

  }

  playAudio(title: string){
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  cancelPass() {
    this.dialogRef.close();
  }

}
