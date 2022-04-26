import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { URL } from '../../../../constants';
import { French, English} from '@app/interfaces/Langues';
// import { SettingsComponent } from '../settings/settings.component';
import { MatDialog } from '@angular/material/dialog';
// import { SettingsComponent } from '../settings/settings.component';
// import { catchError } from 'rxjs/operators';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { RouterOutlet } from '@angular/router';
import { fader } from '@assets/animations';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'], 
  animations: [fader],
})

export class MainPageComponent implements OnInit{

  private readonly BASE_URL: string = URL;
  //"https://projet3-3990-207.herokuapp.com/";
  socket:Socket;
  public rejoindre: string;
  public creer: string;
  public emai: string;
  public pass: string;
  public connection: string;
  public options: string;
  public error1: string;
  public error2: string;
  public error3: string;
  public error4: string;


  constructor(
    public dialog: MatDialog,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
    private ref:ChangeDetectorRef,
    private hotkeyService: HotkeysService,
  ) { 
    this.hotkeyService.hotkeysListener();
  }

  ngOnInit(): void {
    // setTimeout(() => { this.ngOnInit() }, 100);
    this.ref.detectChanges();
    if(this.socketService.language == "french") 
    {
      this.rejoindre = French.join;
      this.creer = French.createAcc; 
      this.emai = French.email;
      this.pass = French.pass;
      this.connection = French.connection;
      this.options = French.options;
      this.error1 = French.error1;
      this.error2 = French.error2;
      this.error3 = French.error3;
      this.error4 = French.error4;
    }
    else {
      this.rejoindre = English.join;
      this.creer = English.createAcc;
      this.emai = English.email;
      this.pass = English.pass;
      this.connection = English.connection;
      this.options = English.options;
      this.error1 = English.error1;
      this.error2 = English.error2;
      this.error3 = English.error3;
      this.error4 = English.error4;
    }

  console.log(this.socketService.theme);
    if(this.socketService.theme == "light grey"){
      document.getElementById("buttonMain")!.style.backgroundColor = LightGrey.main;
      document.getElementById("buttonMain")!.style.color = LightGrey.text;
      document.getElementById("buttonMain2")!.style.backgroundColor = LightGrey.main;
      document.getElementById("buttonMain2")!.style.color = LightGrey.text;
      document.getElementById("buttonMain3")!.style.backgroundColor = LightGrey.main;
      document.getElementById("buttonMain3")!.style.color = LightGrey.text;
      document.getElementById("title01")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title01")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("buttonMain")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("buttonMain")!.style.color = DarkGrey.text;
      document.getElementById("buttonMain2")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("buttonMain2")!.style.color = DarkGrey.text;
      document.getElementById("buttonMain3")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("buttonMain3")!.style.color = DarkGrey.text;
      document.getElementById("title01")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title01")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("buttonMain")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("buttonMain")!.style.color = DeepPurple.text;
      document.getElementById("buttonMain2")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("buttonMain2")!.style.color = DeepPurple.text;
      document.getElementById("buttonMain3")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("buttonMain3")!.style.color = DeepPurple.text;
      document.getElementById("title01")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title01")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("buttonMain")!.style.backgroundColor = LightBlue.main;
      document.getElementById("buttonMain")!.style.color = LightBlue.text;
      document.getElementById("buttonMain2")!.style.backgroundColor = LightBlue.main;
      document.getElementById("buttonMain2")!.style.color = LightBlue.text;
      document.getElementById("buttonMain3")!.style.backgroundColor = LightBlue.main;
      document.getElementById("buttonMain3")!.style.color = LightBlue.text;
      document.getElementById("title01")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title01")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("buttonMain")!.style.backgroundColor = LightPink.main;
      document.getElementById("buttonMain")!.style.color = LightPink.text;
      document.getElementById("buttonMain2")!.style.backgroundColor = LightPink.main;
      document.getElementById("buttonMain2")!.style.color = LightPink.text;
      document.getElementById("buttonMain3")!.style.backgroundColor = LightPink.main;
      document.getElementById("buttonMain3")!.style.color = LightPink.text;
      document.getElementById("title01")!.style.backgroundColor = LightPink.main;
      document.getElementById("title01")!.style.color = LightPink.text;
    }
  }

  password: string;
  email: string;
  conditionValid: boolean;

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  closeClick(): void {
    if (this.email == "" || this.email == null ||
        this.password == "" || this.password == null) {

      document.getElementById("error")!.style.visibility= "visible";
      document.getElementById("error")!.innerHTML = this.error1;
      this.playAudio("error.wav");
      let erreur= document.getElementById("buttonMain2")!;
      erreur.className = "erreuAnimation";
      erreur.classList.remove("erreuAnimation");
      void erreur.offsetWidth;
      erreur.className = "erreuAnimation";
      return;
    }
    else { 
      let link=this.BASE_URL+"user/loginUser";
    
      this.http.post<any>(link,{useremail:this.email,password:this.password}).subscribe((data: any) => {
        this.socketService.userObj = {
          useremail: data.user.useremail,
          nickname: data.user.nickname,
          lastLoggedIn: data.user.lastLoggedIn,
          lastLoggedOut: data.user.lastLoggedOut,
          friends: data.user.friends,
          avatar: data.user.avatar, 
        };
        console.log("EDWIN EST GROS:",  this.socketService.userObj);
        console.log("message:"+data.message);
        console.log("first:"+data.currentRoom);
        if(data.message=="success") {
          this.socketService.email = this.email;
          this.socketService.nickname = data.user.nickname;
          this.socketService.currentRoom=data.currentRoom;
          this.socketService.avatarNumber = data.user.avatar;
          this.socketService.initSocket();
          this.router.navigate(['/', 'albums']);          
          this.playAudio("notif.wav");
        }
      },
      (error:HttpErrorResponse)=>{
        console.error(error);
        console.log(error.status);
        console.log(error.error.message);
        if(error.error.message=="password does not match") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = this.error2;
          this.playAudio("error.wav");
          let erreur= document.getElementById("buttonMain2")!;
          erreur.className = "erreuAnimation";
          erreur.classList.remove("erreuAnimation");
          void erreur.offsetWidth;
          erreur.className = "erreuAnimation";
          return;
        }
        else if(error.error.message=="user already connected") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = this.error3;
          this.playAudio("error.wav");
          let erreur= document.getElementById("buttonMain2")!;
          erreur.className = "erreuAnimation";
          erreur.classList.remove("erreuAnimation");
          void erreur.offsetWidth;
          erreur.className = "erreuAnimation";
          return;
        }
        else if(error.error.message=="user not found !") {
          document.getElementById("error")!.style.visibility= "visible";
          document.getElementById("error")!.innerHTML = this.error4;
          this.playAudio("error.wav");
          let erreur= document.getElementById("buttonMain2")!;
          erreur.className = "erreuAnimation";
          erreur.classList.remove("erreuAnimation");
          void erreur.offsetWidth;
          erreur.className = "erreuAnimation";
          return;
        }
      }
      );
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
  
  //("../../../assets/avatar_1.png");

  openSettings(): void {
    // this.dialog.open(SettingsComponent);
    this.router.navigate(['/', 'settings']);
    this.playAudio("ui2.wav");
  }

  registerClick(): void {
    this.router.navigate(['/', 'register']);
    this.playAudio("ui2.wav");
  }

  avatar():void {
    this.router.navigate(['/','avatar']);
    this.playAudio("ui2.wav");
  }
}
