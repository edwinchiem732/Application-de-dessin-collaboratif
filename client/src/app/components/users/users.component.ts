import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Drawing } from '@app/classes/Drawing';
import { DrawingInterface } from '@app/interfaces/DrawingInterface';
import { DrawingTempService } from '@app/services/drawingTemp.service';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
import { French, English} from '@app/interfaces/Langues';


const ONE_SECOND = 1000;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  private readonly BASE_URL: string = URL;


  public activeUsers:Array<string> = [];
  public ho: number;

  snackbar1: string;
  snackbar2: string;
  add: string;
  added: string;
  addTitle: string;


  constructor(
    public dialogRef: MatDialogRef<UsersComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    public drawingTempSerivce: DrawingTempService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.roomListener();
    this.ho = this.socketService.he;

    if(this.socketService.language == "french") {
      this.snackbar1 = French.snackbar1;
      this.snackbar2 = French.snackbar2;
      this.add = French.add;
      this.added = French.added;
      this.addTitle = French.addTitle;
     }
     else {
       this.snackbar1 = English.snackbar1;
       this.snackbar2 = English.snackbar2;
       this.add = English.add;
       this.added = English.added;
       this.addTitle = English.addTitle;
     }

    console.log("album name", this.socketService.albumName);
    let link = this.BASE_URL + "album/getDrawings/" + this.socketService.albumName;

    this.http.get<any>(link).subscribe((data: any) => {
      this.drawingTempSerivce.drawings.clear();
      this.activeUsers = [];

      data.forEach((drawing:any)=>{
        let drawingObj:Drawing = new Drawing(drawing as DrawingInterface);
        console.log("obj", drawingObj);
        this.drawingTempSerivce.drawings.set(drawingObj.getName() as string, drawingObj);
        
        if(drawing.members != this.socketService.email) {
          this.activeUsers.push(drawing.members);
          console.log(this.activeUsers);
        }
      });
    });
    
   
    // this.roomListener();
  }

  roomListener() {
    this.socketService.getSocket().on("friends modified", (data) => {
      data=JSON.parse(data);
      console.log("HERE");
      if (data.user1.useremail == this.socketService.email) {
        this.socketService.userObj.friends = data.user1.friends;
        console.log("user", this.socketService.userObj.friends);
        console.log("obj", data.user1.friends);
      }
      else if (data.user2.useremail == this.socketService.email){
        this.socketService.userObj.friends = data.user2.friends;
        console.log("user", this.socketService.userObj.friends);
        console.log("obj", data.user1.friends);
      }
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

  addFriend(element: any) {
    let link = this.BASE_URL + "user/addFriend";
    if(element.textContent.trim().slice(18) == this.socketService.email) {
      console.log("tu ne pas add toi meme");
      this.snackBar.open(this.snackbar1, '', { duration: ONE_SECOND, });
      this.playAudio("error.wav");
    }
    else if (this.socketService.userObj.friends.includes(element.textContent.trim().slice(18))) {
      console.log("deja friends");
      this.snackBar.open(this.snackbar2, '', { duration: ONE_SECOND, });
      this.playAudio("error.wav");
    }
    else {
      console.log("FRIEND", element.textContent.trim().slice(18));
      this.http.post<any>(link, {newFriend: this.socketService.email, targetUser: element.textContent.trim().slice(18)}).subscribe((data:any) => { 
        if(data.message == "success") {
          console.log("added friend");
          this.snackBar.open(this.added, '', { duration: ONE_SECOND, });
          this.playAudio("ui2.wav");
        }
      });
    }
  }

}