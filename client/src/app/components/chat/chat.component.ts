import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SocketService } from '@app/services/socket/socket.service';
//import { catchError } from 'rxjs/operators';
//import { RoomsComponent } from '../rooms/rooms.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { URL } from '../../../../constants';
import { French, English } from '@app/interfaces/Langues';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { Logout2Component } from '../logout2/logout2.component';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements AfterViewInit {
  @ViewChild('chatinput') input: any;
  @ViewChild('message-icon') chatzone: HTMLElement;
  private readonly BASE_URL: string = URL;

  public message = new Array<any>();
  public others = new Array<string>();
  public time = new Array<string>();

  public chatTitle: string;
  public roomChange: string;

  public source: string;
  public source2: string;
  // chatTitle: "Clavardage",
  // changeRoom: "Changer de salle",
  public avatarCurrentUser:string;
  public avatarOtherUser:string;

  public currentNickname:String;

  public chatTITLE: string;


  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private socketService: SocketService,
    private router: Router,
    ) { 
    }

  ngAfterViewInit(): void {  
    this.chatTITLE = this.socketService.currentRoom;
    this.playAudio("ui2.wav")
    if(this.router.url == "/clavardage") {
      document.getElementById("principal")!.style.width = "100%";
    }
    else if(this.router.url == "/sidenav") {
      document.getElementById("principal")!.style.width = "500px";
    }

    if(this.socketService.language == "french") {
      this.chatTitle =  French.chatTitle;
      this.roomChange = French.changeRoom;
     }
     else {
       this.chatTitle =  English.chatTitle;
       this.roomChange = English.changeRoom;
     }
     if(this.socketService.theme == "light grey"){
      document.getElementById("title9")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title9")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("title9")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title9")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("title9")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title9")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("title9")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title9")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("title9")!.style.backgroundColor = LightPink.main;
      document.getElementById("title9")!.style.color = LightPink.text;
    }

    switch(this.socketService.avatarNumber) {
      case "1":{
        this.avatarCurrentUser="avatar1.png";
        break;
      }
      case "2":{
        this.avatarCurrentUser="avatar2.png";
        break;
      }
      case "3":{
        this.avatarCurrentUser="avatar3.png";
        break;
      }
      case "4":{
        this.avatarCurrentUser="avatar4.png";
        break;
      }
      case "5":{
        this.avatarCurrentUser="avatar5.png";
        break;
      }
        
    }
    console.info("AVATAR NUM FROM SOCKET",this.socketService.avatarNumber);
    this.avatarCurrentUser="avatar"+this.socketService.avatarNumber+".png";
    this.currentNickname=this.socketService.nickname;

    let link=this.BASE_URL+"message/getRoomMessages/" + `${this.socketService.currentRoom}`;  
    console.log("CHECK MOI HEHE:" + this.socketService.currentRoom);
    this.http.get<any>(link).subscribe((data: any) => {

      let length = Object.keys(data).length;
   
      for(var i = 0; i <= length; i++) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data[i].time, 'dd-MM-yyyy HH:mm:ss') as string;

        if (this.socketService.nickname == data[i].nickname) {

          console.info("old msg",this.avatarOtherUser);
          console.info("old msg current",this.avatarCurrentUser);
      
          console.log(this.source);
          const msg={
            time:formattedDate,
            nickname:data[i].nickname,
            message:data[i].message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
            avatar:data[i].avatar
          } 
          this.message.push(msg);
          //this.others.push(formattedDate + '\n' + data[i].nickname + '\n' + data[i].message.replace(/(\r\n|\n|\r)/gm, " ") + '\n');
 
        }

        if (this.socketService.nickname != data[i].nickname) {
   
          this.avatarOtherUser="avatar"+data[i].avatar+".png";


          console.info(this.avatarOtherUser);
          console.info(this.avatarCurrentUser);

          const msg={
            time:formattedDate,
            nickname:data[i].nickname,
            message:data[i].message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
            avatar:data[i].avatar
          } 
          this.message.push(msg);

        }
      }
    });

    this.socketService.getSocket().on("MSG", (data)=>{
      data = JSON.parse(data);
      this.playAudio("cell_notif.wav");
      console.log("socket room " + this.socketService.currentRoom.trim());
      console.log("data room " + data.roomName);
      console.log("avatar", data.msg.avatar);
      if (data.roomName == this.socketService.currentRoom.trim()) {
   
        console.log("get in bruh");

        this.avatarOtherUser="avatar"+data.msg.avatar+".png";


        console.info(this.avatarOtherUser);
        console.info(this.avatarCurrentUser);

        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;

        const msg={
          time:formattedDate,
          nickname:data.msg.nickname,
          message:data.msg.message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
          avatar:data.msg.avatar
        } 
        this.message.push(msg);

      }
      else if (data.roomName == this.socketService.currentRoom.trim()) {
        const datepipe: DatePipe = new DatePipe('en-CA');
        let formattedDate = datepipe.transform(data.msg.time, 'dd-MM-yyyy HH:mm:ss') as string;
        const msg={
          time:formattedDate,
          nickname:data.msg.nickname,
          message:data.msg.message.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
          avatar:data.msg.avatar
        } 
        this.message.push(msg);

      }
    });
  }

  ngAfterInit() {
    console.log("chat page !");
  }

  playAudio(title: string) {
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }

  leaveDrawing() {
    console.log("current", this.socketService.currentRoom);
    // this.socketService.currentRoom = "randomSHIT";
    let link = this.BASE_URL + "drawing/leaveDrawing";

    if(this.router.url == "/sidenav") {
      this.http.post<any>(link,{ useremail: this.socketService.email}).subscribe((data: any) => {
        console.log("response", data);
        if(data.message == "success") {
          this.playAudio("ui2.wav");
          console.log("EXITED DRAWING" + data.useremail);
        }
      });
      this.router.navigate(['/', 'dessins']);
    }
  }

  changeRoom(): void {
    //this.dialog.open(RoomsComponent, { disableClose: true });
    this.router.navigate(['/', 'rooms']);
    this.playAudio("ui2.wav");
    
    // if(this.router.url == "/sidenav") {
    //   this.socketService.drawingName = this.socketService.currentRoom;
    // }

    this.leaveDrawing();
  }

  sendchatinput(text:String) {
    const currentTime = Date.now();

    if (text.trim() != '') {
      console.log("avatar", this.socketService.avatarNumber);
      const msg = { time: currentTime, nickname: this.socketService.nickname, message: text.trim(), avatar: this.socketService.avatarNumber };
      //const mesg = { roomName: this.socketService.currentRoom, msg: { time: currentTime, nickname: this.socketService.nickname, message: text.trim() }};
      const datepipe: DatePipe = new DatePipe('en-CA');
      let formattedDate = datepipe.transform(currentTime, 'dd-MM-yyyy HH:mm:ss') as string;

      var html = '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>' +
      '<div class="message-icon">' + '<img src= "avatar0.png" alt="Italian Trulli">' + '</div>'
      document.getElementById("message-icon")!.innerHTML += `${html}`;

      const msgSend={
        time:formattedDate,
        nickname:this.socketService.nickname,
        message:text.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n',
        avatar:this.avatarCurrentUser
      } 
      this.message.push(msgSend);
      //this.others.push(formattedDate + '\n' + this.socketService.nickname + '\n' + text.toString().trim().replace(/(\r\n|\n|\r)/gm, " ") + '\n');
      //this.others.push(this.socketService.nickname);
      //this.others.push(text.toString().trim().replace(/(\r\n|\n|\r)/gm, " "));
      //this.others.push("\n");
      //this.message.push('\n\n\n');
      //this.message.push("");
      //this.message.push("");
      //this.message.push("\n");

      this.playAudio("msg.wav");

      this.socketService.getSocket().emit("MSG",JSON.stringify(msg));

      this.input.nativeElement.value = ' ';
    }

    if (text.trim().length == 0) {
      this.input.nativeElement.value = ' ';
    }
    this.input.nativeElement.focus();
  }

  public userDataCall() { 
    let link=this.BASE_URL + "userData/msg";

    this.http.post<any>(link,{ msg:"sjdakjsd",user:"admin" }).subscribe((data: any) => {
      console.log(data);
    });
  }

  logout() {
    /*let link = this.BASE_URL + "user/logoutUser";

    this.playAudio("ui1.wav");
    // this.socketService.disconnectSocket();

    this.leaveDrawing();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });*/
    this.dialog.open(Logout2Component);
  }
}