// import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { URL } from '../../../../constants';


@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  // fileName = '';

  BASE_URL:String=URL;

  constructor(
    // private http: HttpClient,
    public dialogRef: MatDialogRef<AvatarComponent>,
    private socketService: SocketService,
    // private router: Router,
    ) {}

  ngOnInit(): void {

  }

  image(element: any) {
    this.socketService.avatarNumber = element.textContent.trim();
    this.socketService.avatarClick = true;
    console.log(element.textContent.trim());
    this.playAudio("ui2.wav");
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

  // onFileSelected(event:any) {

  //   const file:File = event.target.files[0];

  //   if (file) {

  //       this.fileName = file.name;

  //       const formData = new FormData();

  //       formData.append("thumbnail", file);

  //       const upload$ = this.http.post("/api/thumbnail-upload", formData);

  //       upload$.subscribe();
  //   }
  // }


  // processFile(fileInput: HTMLInputElement) {
  //   let image:number[]=[];
  //   if(fileInput.files && fileInput.files[0] != null) {
  //     let file: File = fileInput.files[0];
  //     console.log(file);
  //     var reader = new FileReader();
  //     reader.readAsArrayBuffer(file);
  //     reader.onload = () => {
  //       var arrayBuffer = reader.result
  //       const typedArray = new Uint8Array(arrayBuffer as ArrayBuffer);
  //       const array = [...typedArray];    
  //       image=array;
  //       console.log(image);
        
  //       let user={
  //         name:"123",
  //         image:image
  //       }
  
  //       console.log("post",user.image)
  
  //       this.http.post(this.BASE_URL+"image/upload",user).subscribe((data)=>{
  //         console.log(data);
  //       })
  //     };
      


    
     
  //   }
  // }

}


