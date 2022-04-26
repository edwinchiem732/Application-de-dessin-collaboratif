import { Injectable } from "@angular/core";
import { Album } from "@app/classes/Album";

@Injectable({
    providedIn: 'root',
  })
  export class AlbumTempService {

    albums:Map<string, Album>; //store le name du album, album

    constructor() {
        this.albums = new Map<string, Album>(); 
    }

  }