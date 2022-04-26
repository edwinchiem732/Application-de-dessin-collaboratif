import { AlbumInterface } from "../Interface/AlbumInterface";
import { ProtectedAlbumInterface } from "../Interface/ProtectedAlbumInterface";

import { Album } from "./Album";


export class ProtectedAlbum extends Album {
    private password:String;

    constructor(album:ProtectedAlbumInterface) {
        const base={
            albumName:album.albumName,
            creator:album.creator,
            drawings:album.drawings,
            visibility:album.visibility,
            dateCreation:album.dateCreation,
            description:album.description,
            members:album.members,
            requests:album.requests
        } as AlbumInterface

        super(
          base
        );

        this.password=album.password;
    }

    getPassword():String {
        return this.password;
    }

    setPassword(password:String):void {
        this.password=password;
    }
    
}