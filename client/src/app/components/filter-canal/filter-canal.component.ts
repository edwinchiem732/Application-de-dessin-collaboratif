// import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DrawingTempService } from '@app/services/drawingTemp.service';
// import { SocketService } from '@app/services/socket/socket.service';
// import { URL } from '../../../../constants';


@Component({
  selector: 'app-filter-canal',
  templateUrl: './filter-canal.component.html',
  styleUrls: ['./filter-canal.component.scss']
})
export class FilterCanalComponent implements OnInit {

  // private readonly BASE_URL=URL;
  public numberOfRooms: number ;
  public buttonsTexts:Array<string> = [];

  constructor(
    public dialogRef: MatDialogRef<FilterCanalComponent>,
    public dialog: MatDialog,
    // private socketService: SocketService,
    public drawingTempSerivce: DrawingTempService,
    // private http: HttpClient,
  ) { }

  ngOnInit(): void {
  }

  find(text: string) {
    // this.socketService.filtered = true;
    // console.log("ici", text.trim());
    // let link = this.BASE_URL + "room/getAllRooms";
    // this.http.get<any>(link).subscribe((data: any) => {
    //   let length = Object.keys(data).length;
    //   this.numberOfRooms = length;
    //   console.log(text);
    //   this.socketService.buttons = [];
    //   for(var i = 0; i <= length - 1; i++) { 
    //     console.log("data", data[i]);
    //     console.log("??", data[i].roomName);
    //     if (data[i].roomName == text.trim() || data[i].creator == text.trim()) {
    //       console.log("GOT IN!");
    //       // this.buttonsTexts = [...this.buttonsTexts, `${data[i].roomName}, (par ${data[i].creator})`];
    //       if(!this.drawingTempSerivce.drawings.has(data[i].roomName)) {
    //         this.socketService.buttons = [... this.socketService.buttons, `${data[i].roomName}`];
    //       }
    //     }
    //   }
    // });
  }
}
