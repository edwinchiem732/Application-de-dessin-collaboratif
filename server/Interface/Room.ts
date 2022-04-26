import { MessageInterface } from "./Message";

export interface RoomInterface {
    roomName:String;
    creator:String;
    members:String[];
    messages:Array<MessageInterface>;
}
