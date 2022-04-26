import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Album } from '@app/classes/Album';
import { AlbumInterface } from '@app/interfaces/AlbumInterface';
import { AlbumTempService } from '@app/services/albumTempService';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';
import { French, English} from '@app/interfaces/Langues';



@Component({
  selector: 'app-new-album',
  templateUrl: './new-album.component.html',
  styleUrls: ['./new-album.component.scss']
})
export class NewAlbumComponent implements OnInit {

  private readonly BASE_URL=URL;
  public numberOfAlbums: number;
  public AlbumsNames:Array<string> = [];
  public AlbumsVisibilite:Array<string> = [];
  name: string;
  description: string;

  albumCreationTitle: string;
  placeHolderName: string;
  placeHolderDescription: string;
  albumExistAlready: string; 
  error1: string;
  cancelCreationAlbum: string;
  createConfirmAlbum: string;
  nameOfTheAlbum: string;
  descriptionOfTheAlbum: string;


  constructor(
    public dialogRef: MatDialogRef<NewAlbumComponent>,
    private socketService: SocketService,
    private http: HttpClient,
    private hotkeyService: HotkeysService,
    public albumTempSerivce: AlbumTempService,
  ) { 
    this.hotkeyService.hotkeysListener();
  }

  ngOnInit(): void {
    let link2 = this.BASE_URL + "album/getAlbums";
    this.http.get<any>(link2).subscribe((data: any) => {
      this.albumTempSerivce.albums.clear();
      let length = Object.keys(data).length;
      this.numberOfAlbums = length;
      this.AlbumsNames = [];
      data.forEach((albums:any)=>{
        let albumObj:Album = new Album(albums as AlbumInterface);
        this.albumTempSerivce.albums.set(albumObj.getName() as string, albumObj);
        this.AlbumsNames.push(albums.albumName);
      });
    });

    if(this.socketService.language == "french") {
      this.albumCreationTitle = French.createAlbum;
      this.placeHolderName = French.placeHolderName;
      this.placeHolderDescription = French.placeHolderDescription;
      this.nameOfTheAlbum = French.nameOfTheAlbum;
      this.descriptionOfTheAlbum = French.descriptionOfTheAlbum;
      this.cancelCreationAlbum = French.cancelCreationAlbum;
      this.createConfirmAlbum = French.createConfirmAlbum;
      this.albumExistAlready = French.albumExistAlready;
      this.error1 = French.error1;
     }
     else {
       this.albumCreationTitle = English.createAlbum;
       this.placeHolderName = English.placeHolderName;
       this.placeHolderDescription = English.placeHolderDescription;
       this.nameOfTheAlbum = English.nameOfTheAlbum;
       this.descriptionOfTheAlbum = English.descriptionOfTheAlbum;
       this.cancelCreationAlbum = English.cancelCreationAlbum;
       this.createConfirmAlbum = English.createConfirmAlbum;
       this.albumExistAlready = English.albumExistAlready;
       this.error1 = English.error1;
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

  createAlbum() : void  {

    
    let link = this.BASE_URL + "album/createAlbum";
    
    if(this.name == null || this.description == null || this.name == "" || this.description == "") {
      document.getElementById("errorAlbum")!.style.visibility= "visible";
      document.getElementById("errorAlbum")!.innerHTML = this.error1;
      this.playAudio("error.wav");
      let erreur= document.getElementById("createalbum")!;
      erreur.className = "erreuAnimation";
      erreur.classList.remove("erreuAnimation");
      void erreur.offsetWidth;
      erreur.className = "erreuAnimation";
    }
    else if (this.albumTempSerivce.albums.has(this.name)) {
      console.log("je existe deja");
      document.getElementById("errorAlbum")!.style.visibility= "visible";
      document.getElementById("errorAlbum")!.innerHTML = this.albumExistAlready;
      this.playAudio("error.wav");
      let erreur= document.getElementById("createalbum")!;
      erreur.className = "erreuAnimation";
      erreur.classList.remove("erreuAnimation");
      void erreur.offsetWidth;
      erreur.className = "erreuAnimation";
    }
    else {
      this.http.post<any>(link, {albumName: this.name.trim(), creator: this.socketService.email, visibility:"private", description: this.description}).subscribe((data:any) => {
        if(data.message == "success") {
          console.log("ALBUM CREATED");
          this.playAudio("ui1.wav");
        }
        else {
          this.playAudio("error.wav");
        }
      });
      this.dialogRef.close();
    }

  }    

  close() {
    this.dialogRef.close();
  }

}
