import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
import { French, English } from '@app/interfaces/Langues';

@Component({
  selector: 'app-accept-request',
  templateUrl: './accept-request.component.html',
  styleUrls: ['./accept-request.component.scss']
})
export class AcceptRequestComponent implements OnInit {

  private readonly BASE_URL: string = URL;

  public memReq: string;

  requestTitle: string;
  question: string;
  accept: string;
  annuler: string;

  constructor(
    public dialogRef: MatDialogRef<AcceptRequestComponent>,
    private http: HttpClient,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    this.roomListener();
    this.memReq = this.socketService.memberRequest;

    if(this.socketService.language == "french") {
      this.requestTitle = French.requestTitle;
      this.question = French.question;
      this.accept = French.accept;
      this.annuler = French.cancelCreationCanal;
    }
    else {
      this.requestTitle = English.requestTitle;
      this.question = English.question;
      this.accept = English.accept;
      this.annuler = English.cancelCreationCanal;
    }
  }

  roomListener() {
    this.socketService.getSocket().on("ALBUMMODIFIED", (data) => {
      data=JSON.parse(data);
      console.log(data.album);
      this.dialogRef.close();
    });
  }

  acceptRequest() {
    let link = this.BASE_URL + "album/acceptRequest";

    console.log("useremail", this.socketService.email);
    console.log("request", this.socketService.memberRequest);
    console.log("albumName", this.socketService.albumName);
    this.http.post<any>(link, {useremail: this.socketService.email, request: this.socketService.memberRequest, albumName: this.socketService.albumName}).subscribe((data:any) => { 
      if(data.message == "success") {
          console.log("ACCEPTED");
          const msg={ 
            member:this.socketService.memberRequest
          }
          this.socketService.getSocket().emit("REQUESTACCEPT",JSON.stringify(msg));
          this.playAudio("ui2.wav");
        }
    });
      this.dialogRef.close();
  }

  playAudio(title: string){
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  cancelRequest() {
    this.dialogRef.close();
  }

}
