import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { French, English} from '@app/interfaces/Langues';
import { SidenavService } from '@app/services/sidenav/sidenav.service';


@Component({
  selector: 'app-logout',
  templateUrl: './reinit.component.html',
  styleUrls: ['./reinit.component.scss']
})

export class ReinitComponent implements OnInit {

  public reinit: string;
  public cancel: string;
  public init: string;
  public certain: string;

  constructor(
    public dialogRef: MatDialogRef<ReinitComponent>,
    private socketService: SocketService,
    private sidenavService: SidenavService,
  ) { }

  ngOnInit() {
    if (this.socketService.language == "french") {
      this.reinit = French.reinit;
      this.cancel = French.cancel;
      this.init = French.init;
      this.certain = French.certain;
    }
    else {
      this.reinit = English.reinit;
      this.cancel = English.cancel;
      this.init = English.init;
      this.certain = English.certain;
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

  quit() {
    this.sidenavService.click();
    this.playAudio("bin.wav")
    this.dialogRef.close();
  }
}
