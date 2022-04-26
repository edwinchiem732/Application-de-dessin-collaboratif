export class Account {
    private useremail:String;
    private password:String;
    private nickname:String;

    constructor(useremail:String,password:String,nickname:String) {
        this.useremail=useremail;
        this.password=password;
        this.nickname=nickname;
    }

    getUserEmail():String {
        return this.useremail;
    }

    getUserPassword():String {
        return this.password;
    }

    getUserNickname():String {
        return this.nickname;
    }

    setUserEmail(mail:String):void {
        this.useremail=mail;
    }

    setUserPassword(password:String):void {
        this.password=password;
    }

    setUserNickname(name:String):void {
        this.nickname=name;
    }


}
