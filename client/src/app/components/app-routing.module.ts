import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AlbumsComponent } from './albums/albums.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ChatComponent } from './chat/chat.component';
import { ClavardageComponent } from './clavardage/clavardage.component';
import { DessinsComponent } from './dessins/dessins.component';
import { MainPageComponent } from './main-page/main-page.component';
import { NewAccountComponent } from './new-account/new-account.component';
import { ProfilComponent } from './profil/profil.component';
import { RoomsComponent } from './rooms/rooms.component';
import { SettingsComponent } from './settings/settings.component';
import { SidenavComponent } from './sidenav/sidenav.component';

const routes: Routes = [
  {
    path: '', component: MainPageComponent, data: {animation:'isRight'}
  },
  {
    path: 'main', component: MainPageComponent, data: {animation:'isRight'}
  },
  {
    path: 'chat', component: ChatComponent
  },
  {
    path: 'register', component: NewAccountComponent, data: {animation:'isRight'}
  },
  {
    path: 'albums', component: AlbumsComponent, data: {animation:'isLeft'}
  },
  {
    path: 'rooms', component: RoomsComponent
  },
  {
    path: 'sidenav', component: SidenavComponent
  },
  {
    path: 'dessins', component: DessinsComponent
  },
  {
    path: 'clavardage', component: ClavardageComponent
  },
  {
    path:'avatar',component:AvatarComponent
  },
  {
    path:'settings',component:SettingsComponent
  },
  {
    path:'profil',component:ProfilComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
