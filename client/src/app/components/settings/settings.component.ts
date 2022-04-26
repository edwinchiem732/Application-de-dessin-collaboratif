import { Component, OnInit } from '@angular/core';
// import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';
import { LightGrey, DarkGrey, DeepPurple, LightBlue, LightPink } from '@app/interfaces/Themes';
import { French, English } from '@app/interfaces/Langues';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  langue: string = '';

  public change: string;
  public parameter: string;
  public theme: string;
  public confirm: string;

  public Light_grey: string;
  public Dark_grey: string;
  public Deep_Purple: string;
  public Ligh_blue: string;
  public Light_Pink: string;
  public cancel: string;


  constructor(
    // public dialogRef: MatDialogRef<SettingsComponent>,
    private socketService: SocketService,
  ) { }

  ngOnInit(): void {
    if (this.socketService.language == "french") {
      this.change = French.change;
      this.parameter = French.parameter;
      this.theme = French.theme;
      this.confirm = French.confirm2;
      this.cancel = French.cancel;

      this.Light_grey = French.Light_grey;
      this.Dark_grey = French.Dark_grey;
      this.Deep_Purple = French.Deep_Purple;
      this.Ligh_blue = French.Ligh_blue;
      this.Light_Pink = French.Light_Pink;
    }
    else {
      this.change = English.change;
      this.parameter = English.parameter;
      this.theme = English.theme;
      this.confirm = English.confirm2;
      this.cancel = English.cancel;

      this.Light_grey = English.Light_grey;
      this.Dark_grey = English.Dark_grey;
      this.Deep_Purple = English.Deep_Purple;
      this.Ligh_blue = English.Ligh_blue;
      this.Light_Pink = English.Light_Pink;
    }

    if(this.socketService.theme == "light grey"){
      document.getElementById("title0")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title0")!.style.color = LightGrey.text;
      document.getElementById("langue")!.style.backgroundColor = LightGrey.main;
      document.getElementById("langue")!.style.color = LightGrey.text;
      document.getElementById("langue2")!.style.backgroundColor = LightGrey.main;
      document.getElementById("langue2")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("title0")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title0")!.style.color = DarkGrey.text;
      document.getElementById("langue")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("langue")!.style.color = DarkGrey.text;
      document.getElementById("langue2")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("langue2")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("title0")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title0")!.style.color = DeepPurple.text;
      document.getElementById("langue")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("langue")!.style.color = DeepPurple.text;
      document.getElementById("langue2")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("langue2")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("title0")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title0")!.style.color = LightBlue.text;
      document.getElementById("langue")!.style.backgroundColor = LightBlue.main;
      document.getElementById("langue")!.style.color = LightBlue.text;
      document.getElementById("langue2")!.style.backgroundColor = LightBlue.main;
      document.getElementById("langue2")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("title0")!.style.backgroundColor = LightPink.main;
      document.getElementById("title0")!.style.color = LightPink.text;
      document.getElementById("langue")!.style.backgroundColor = LightPink.main;
      document.getElementById("langue")!.style.color = LightPink.text;
      document.getElementById("langue2")!.style.backgroundColor = LightPink.main;
      document.getElementById("langue2")!.style.color = LightPink.text;
    }
  }

  language(event: any) {
    this.langue = event.target.value;
    console.log(this.langue);
    if (this.langue == "1") {
      this.socketService.language = "french";  
    }
    else {
      this.socketService.language = "english";
    }
    console.log(this.socketService.language);
    this.playAudio("ui2.wav");
  }

  playAudio(title: string) {
    if (this.socketService.mute == false) {
      let audio = new Audio();
      audio.src = "../../../assets/" + title;
      audio.load();
      audio.play();
    }
  }
  
  onValChange(value: any){
    this.socketService.language = value;

    if (this.socketService.language == "french") {
      this.change = French.change;
      this.parameter = French.parameter;
      this.theme = French.theme;
      this.confirm = French.confirm2;

      this.Light_grey = French.Light_grey;
      this.Dark_grey = French.Dark_grey;
      this.Deep_Purple = French.Deep_Purple;
      this.Ligh_blue = French.Ligh_blue;
      this.Light_Pink = French.Light_Pink;
    }
    else {
      this.change = English.change;
      this.parameter = English.parameter;
      this.theme = English.theme;
      this.confirm = English.confirm2;

      this.Light_grey = English.Light_grey;
      this.Dark_grey = English.Dark_grey;
      this.Deep_Purple = English.Deep_Purple;
      this.Ligh_blue = English.Ligh_blue;
      this.Light_Pink = English.Light_Pink;
    }
    this.playAudio("ui2.wav");
  }

  annuler(): void {
    this.playAudio("ui2.wav");
  }

  onChange(value: any) {
    this.socketService.theme = value;
    console.log(this.socketService.theme);

    if(this.socketService.theme == "light grey"){
      document.getElementById("title0")!.style.backgroundColor = LightGrey.main;
      document.getElementById("title0")!.style.color = LightGrey.text;
      document.getElementById("langue")!.style.backgroundColor = LightGrey.main;
      document.getElementById("langue")!.style.color = LightGrey.text;
      document.getElementById("langue2")!.style.backgroundColor = LightGrey.main;
      document.getElementById("langue2")!.style.color = LightGrey.text;
    }
    else if(this.socketService.theme == "dark grey"){
      document.getElementById("title0")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("title0")!.style.color = DarkGrey.text;
      document.getElementById("langue")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("langue")!.style.color = DarkGrey.text;
      document.getElementById("langue2")!.style.backgroundColor = DarkGrey.main;
      document.getElementById("langue2")!.style.color = DarkGrey.text;
    }
    else if(this.socketService.theme == "deep purple") {       
      document.getElementById("title0")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("title0")!.style.color = DeepPurple.text;
      document.getElementById("langue")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("langue")!.style.color = DeepPurple.text;
      document.getElementById("langue2")!.style.backgroundColor = DeepPurple.main;
      document.getElementById("langue2")!.style.color = DeepPurple.text;
    }
    else if(this.socketService.theme == "light blue") { 
      document.getElementById("title0")!.style.backgroundColor = LightBlue.main;
      document.getElementById("title0")!.style.color = LightBlue.text;
      document.getElementById("langue")!.style.backgroundColor = LightBlue.main;
      document.getElementById("langue")!.style.color = LightBlue.text;
      document.getElementById("langue2")!.style.backgroundColor = LightBlue.main;
      document.getElementById("langue2")!.style.color = LightBlue.text;
    }
    else if(this.socketService.theme == "light pink") {  
      document.getElementById("title0")!.style.backgroundColor = LightPink.main;
      document.getElementById("title0")!.style.color = LightPink.text;
      document.getElementById("langue")!.style.backgroundColor = LightPink.main;
      document.getElementById("langue")!.style.color = LightPink.text;
      document.getElementById("langue2")!.style.backgroundColor = LightPink.main;
      document.getElementById("langue2")!.style.color = LightPink.text;
    }
    this.playAudio("ui2.wav");
  }

  //Pour que VS code piss off
  something() {
    console.log(this.change);
    console.log(this.confirm);
    console.log(this.parameter);
    console.log(this.theme);

    console.log(this.Ligh_blue);
    console.log(this.Light_Pink);
    console.log(this.Light_grey);
    console.log(this.Dark_grey);
    console.log(this.Deep_Purple);
  }
}