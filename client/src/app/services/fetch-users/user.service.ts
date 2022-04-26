import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})

export class UserService {
  //private onlineUser:Map<string, string> = new Map();
  //private userSocketId = new Map<string, string>();
  //private user: any = { email: "test", socketId: "" };
  private user: string = "test";

constructor() { }

  /*fetchUsers() {
    return this.onlineUser;
  }

  addUser(useremail: string, nickname: string) {
    this.onlineUser.set(useremail, nickname);
    console.log(this.onlineUser.get(useremail) + "nickname");
  }

  removeUser(useremail: string) {
    this.onlineUser.delete(useremail);
  }

  fetchUserSockets() {
    return this.userSocketId;
  }

  addUserSocketId(socketId: string, useremail: string) {
    this.userSocketId.set(socketId.trim(), useremail);
    console.log(this.userSocketId.get(socketId.trim()) + "user socket");
  }

  removeUserSocketId(socketId: string) {
    this.userSocketId.delete(socketId);
  }

  fetchUserNicknameBySocketId(socketId: string) {
    let email = this.userSocketId.get(socketId.trim()) as string;
    console.log(this.userSocketId.get(socketId.trim()) + "fetch user nickname");
    console.log(this.userSocketId, "map");
    console.log(this.onlineUser.get(socketId) + "nickname");
    return email;
  }*/

  /*setTempUser(userEmail: string, userSocket: string): void {
    this.user.email = userEmail;
    this.user.socketId = userSocket;
  }

  getTempUser(): any {
    return this.user;
  }

  setTempUserEmail(userName: string): void {
    this.user.email = userName;
  }*/

  getTempUserEmail(): string {
    return this.user;
    console.log("get temp");
  }

  /*getTempUserSocketId(): any {
    return this.user.socketId;
  }*/

  /*setTempUsername(username: string) {
    this.username = username;
  }

  getTempUsername() {
    return this.username;
  }*/
}
