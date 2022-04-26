package com.mocircle.cidrawing.utils;

import java.util.ArrayList;


public class UserProfilObj {
    public String useremail;
    public String nickname;
    public String lastLoggedIn;
    public String lastLoggedOut;
    public ArrayList<String> friends;
    public String avatar;

    public UserProfilObj(String useremail,
                         String nickname,
                         String lastLoggedIn,
                         String lastLoggedOut,
                         ArrayList<String> friends,
                         String avatar) {
        this.useremail = useremail;
        this.nickname = nickname;
        this.lastLoggedIn = lastLoggedIn;
        this.lastLoggedOut = lastLoggedOut;
        this.friends = friends;
        this.avatar = avatar;
    }

    @Override
    public String toString() {
        return "UserProfilObj{" +
                "useremail='" + useremail + '\'' +
                ", nickname='" + nickname + '\'' +
                ", lastLoggedIn='" + lastLoggedIn + '\'' +
                ", lastLoggedOut='" + lastLoggedOut + '\'' +
                ", friends=" + friends +
                ", avatar='" + avatar + '\'' +
                '}';
    }
}
