import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
import { French, English} from '@app/interfaces/Langues';


@Component({
  selector: 'app-create-canal',
  templateUrl: './create-canal.component.html',
  styleUrls: ['./create-canal.component.scss']
})
export class CreateCanalComponent implements OnInit {
  @ViewChild('roomname') input: any;
  private readonly BASE_URL=URL;
  room: string;

  placeHolderCreateRoom: string;
  cancelCreationCanal: string;
  createConfirmCanal: string;
  labelNameCanal: string;
  error1: string;
  roomAlreadyExists: string;
  creaRoom: string;

  constructor(
    public dialogRef: MatDialogRef<CreateCanalComponent>,
    public dialog: MatDialog,
    private socketService: SocketService,
    private http: HttpClient,
    // private router: Router,
    // public drawingTempSerivce: DrawingTempService,
  ) { }

  ngOnInit(): void {
    if(this.socketService.language == "french") {
      this.creaRoom = French.createRoom;
      this.placeHolderCreateRoom = French.placeHolderCreateRoom;
      this.cancelCreationCanal = French.cancelCreationCanal;
      this.createConfirmCanal = French.createConfirmCanal;
      this.labelNameCanal = French.labelNameCanal;
      this.error1 = French.error1;
      this.roomAlreadyExists = French.roomAlreadyExists;
    }
     else {
      this.creaRoom = English.createRoom;
       this.placeHolderCreateRoom = English.placeHolderCreateRoom;
       this.cancelCreationCanal = English.cancelCreationCanal;
       this.createConfirmCanal = English.createConfirmCanal;
       this.labelNameCanal = English.labelNameCanal;
       this.error1 = English.error1;
       this.roomAlreadyExists = English.roomAlreadyExists;
     }
  }


  create(text: string) {
    let link = this.BASE_URL+"room/createRoom";
    let link2 = this.BASE_URL+"room/getAllRooms";

    text.trim();
    if (text.trim() != '') {
      this.http.get<any>(link2).subscribe((data: any) => {
        
            document.getElementById("error")!.style.visibility= "hidden";
            this.http.post<any>(link, { roomName: this.room.trim(), creator: this.socketService.email }).subscribe((data: any) => {
              if (data.message == "success") {
                console.log(data.message);
                this.dialogRef.close();
              }
            },(error:HttpErrorResponse)=>{
              console.error(error);
              console.log(error.status);
              console.log(error.error.message);
              if( error.error.message == "404 (Not Found)" || data == 404 || error.error.message == "Http failure response for "+this.BASE_URL+"/room/createRoom: 404 Not Found" || error.error.message == "failed") {
                this.playAudio("error.wav");
                document.getElementById("errorCanal")!.style.visibility= "visible";
                document.getElementById("errorCanal")!.innerHTML = this.roomAlreadyExists;
              }
            }
            );
      });
    }

      // if c'est vide
      if (text.trim().length == 0) {
        this.input.nativeElement.value = ' ';
      }
      if (text.trim() == "" || text.trim() == null) {
        this.playAudio("error.wav");
        document.getElementById("errorCanal")!.style.visibility= "visible";
        document.getElementById("errorCanal")!.innerHTML = this.error1;
      }
      
      this.input.nativeElement.focus();
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
  }


}
