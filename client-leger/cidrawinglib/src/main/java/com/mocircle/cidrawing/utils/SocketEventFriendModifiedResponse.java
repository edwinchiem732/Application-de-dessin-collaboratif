package com.mocircle.cidrawing.utils;

public class SocketEventFriendModifiedResponse {
    public UserProfilObj user1;
    public UserProfilObj user2;

    public SocketEventFriendModifiedResponse(UserProfilObj user1, UserProfilObj user2) {
        this.user1 = user1;
        this.user2 = user2;
    }

    @Override
    public String toString() {
        return "SocketEventFriendModifiedResponse{" +
                "user1=" + user1 +
                ", user2=" + user2 +
                '}';
    }
}
