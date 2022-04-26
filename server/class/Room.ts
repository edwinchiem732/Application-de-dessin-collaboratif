import { MessageInterface } from "../Interface/Message";



export class Room {
    private roomName:String;
    private creator:String;
    private members:String[]=[];
    private messages:Array<MessageInterface>;

    constructor(roomName:String,creator:String,members:String[],messages:MessageInterface[]) {
       this.roomName=roomName;
       this.creator=creator;
       this.members=members;
       this.messages=messages;
    }

    getRoomName():String {
        return this.roomName;
    }

    getRoomCreator():String {
        return this.creator;
    }

    getUsersInRoom():String[] {
        return this.members;
    }

    addUserToRoom(useremail:String):void {
        this.members.push(useremail);
    }

    removeUserFromRoom(useremail:String):void {
        const index = this.members.indexOf(useremail);
        
        if (index > -1) {
            this.members.splice(index, 1); 
        }
    }

    getRoomMessages():Array<MessageInterface> {
        return this.messages;
    }

    addMessageToRoom(message:MessageInterface) {
        this.messages.push(message);
    }

    setRoomName(name:String) {
        this.roomName=name;
    }
}
