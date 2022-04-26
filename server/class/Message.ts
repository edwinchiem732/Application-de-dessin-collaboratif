

export class Message {

    private time:Number;
    private nickname:String;
    private message:String;

    constructor(time:Number,nickname:String,message:String) {
       this.time=time;
       this.nickname=nickname;
       this.message=message;
    }

    getTime():Number {
        return this.time;
    }

    getNickname():String {
        return this.nickname;
    }

    getMessage():String {
        return this.message;
    }
}
