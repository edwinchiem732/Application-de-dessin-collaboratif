import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { French, English} from '@app/interfaces/Langues';
import { Router } from '@angular/router';


@Component({
  selector: 'app-logout',
  templateUrl: './logout2.component.html',
  styleUrls: ['./logout2.component.scss']
})

export class Logout2Component implements OnInit {

  private readonly BASE_URL: string = URL;
  public qui: string;
  public cancel: string;
  public leave: string;
  public logout: string;

  constructor(
    public dialogRef: MatDialogRef<Logout2Component>,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit() {
    if (this.socketService.language == "french") {
      this.qui = French.quit;
      this.cancel = French.cancel;
      this.leave = French.leave;
      this.logout = French.logout;
    }
    else {
      this.qui = English.quit;
      this.cancel = English.cancel;
      this.leave = English.leave;
      this.logout = English.logout;
    }
  }

  playAudio(title: string) {
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  annuler() {
    this.dialogRef.close();
    this.playAudio("ui2.wav");
  }

  leaveDrawing() {
    console.log("current", this.socketService.currentRoom);
    // this.socketService.currentRoom = "randomSHIT";
    let link = this.BASE_URL + "drawing/leaveDrawing";

    if(this.router.url == "/sidenav") {
      console.log("socket", this.socketService.email);
      this.http.post<any>(link,{ useremail: this.socketService.email}).subscribe((data: any) => {
        console.log("response", data);
        if(data.message == "success") {
          console.log("EXITED DRAWING" + data.useremail);
        }
      });
    }
  }

  quit() {
    let link = this.BASE_URL + "user/logoutUser";
    console.log("huh?");

    this.playAudio("ui1.wav");
    // this.socketService.disconnectSocket();

    this.leaveDrawing();

    console.log("boomer");

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      console.log("gimme the memes");

      if (data.message == "success") {
        console.log("sayonara");
        this.router.navigate(['/', 'main']);
        this.dialogRef.close();
      }   
    });
  }
}

