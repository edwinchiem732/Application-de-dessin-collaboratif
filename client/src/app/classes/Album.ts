import { AlbumInterface } from "../interfaces/AlbumInterface";

export class Album {
    private albumName:String;
    private creator:String;
    private drawings:String[];
    private visibility:String;
    private dateCreation:Number;
    private description:String;
    private members:String[];
    private requests:String[];

    constructor(album:AlbumInterface) {
        this.albumName=album.albumName;
        this.creator=album.creator;
        this.drawings=album.drawings;
        this.visibility=album.visibility;
        this.dateCreation=album.dateCreation;
        this.description=album.description;
        this.members=album.members;
        this.requests=album.requests;
    }

    getName():String {
        return this.albumName;
    }

    getCreator():String {
        return this.creator;
    }

    getDrawings():String[] {
        return this.drawings;
    }

    getVisibility():String {
        return this.visibility;
    }

    getDateCreation():Number {
        return this.dateCreation;
    }

    getDescription():String {
        return this.description;
    }

    getMembers():String[] {
        return this.members;
    }

    getRequests():String[] {
        return this.requests;
    }

    setDrawings(drawings:String[]):void {
        this.drawings=drawings;
    }

    addDrawing(drawingName:String):void {
        this.drawings.push(drawingName);
    }

    removeDrawing(drawingName:String):void {
        const index = this.drawings.indexOf(drawingName);
        
        if (index > -1) {
            this.drawings.splice(index, 1); 
        }
    }

    setName(name:String):void {
        this.albumName=name;
    }

    setDateCreation(time:number):void {
        this.dateCreation=time;
    }

    setDescription(text:String) {
        this.description=text;
    }

    setMembers(members:String[]) {
        this.members=members;
    }

    addMember(member:String) {
        this.members.push(member);
    }

    removeMember(member:String) {
        const index = this.members.indexOf(member);
        if (index > -1) {
            this.members.splice(index, 1); 
        }
    }

    setRequests(requests:String[]):void {
        this.requests=requests;
    }

    addRequest(request:String):void {
        this.requests.push(request);
    }

    removeRequest(request:String):void {
        const index = this.requests.indexOf(request);
        if (index > -1) {
            this.requests.splice(index, 1); 
        }
    }
    

   
}