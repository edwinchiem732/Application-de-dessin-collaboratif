import { AlbumInterface } from "./AlbumInterface";

export interface ProtectedAlbumInterface extends AlbumInterface {
    password:String;
}

export function checkProtectedAlbum(object:any):object is ProtectedAlbumInterface {
    return 'password'!==undefined;
}
