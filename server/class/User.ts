export class User {
    private useremail:String;
    private nickname:String;
    private lastLoggedIn:Number;
    private lastLoggedOut:Number;
    private avatar:String;
    private friends:String[]=[];
   

    constructor(useremail:String,nickname:String,avatar:String,friends:String[]) {
        this.useremail=useremail;
        this.nickname=nickname;
        this.avatar=avatar;
        this.friends=friends;
    }

    getUseremail():String {
        return this.useremail;
    }

    getUserNickname():String {
        return this.nickname;
    }

    getLastLoggedIn():Number {
        return this.lastLoggedIn;
    }


    getLastLoggedOut():Number {
        return this.lastLoggedOut;
    }

    getAvatar():String {
        return this.avatar;
    }

    getFriends():String[] {
        return this.friends;
    }


    setUseremail(useremail:String):void {
        this.useremail=useremail;
    }

    setUserNickname(name:String):void {
        this.nickname=name;
    }

    setLastLoggedIn(time:Number):void {
        this.lastLoggedIn=time;
    }

    setLastLoggedOut(time:Number):void {
        this.lastLoggedOut=time;
    }

    setAvatar(avatar:String):void {
        this.avatar=avatar;
    }

    setFriends(friends:String[]):void {
        this.friends=friends;
    }

    addFriend(friend:String) {
        this.friends.push(friend);
    }

    removeFriend(friend:String) {
        const index = this.friends.indexOf(friend);
        
        if (index > -1) {
            this.friends.splice(index, 1); 
        }
    }


}
