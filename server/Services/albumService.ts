import { Album } from '../class/Album';
import { SOCKETEVENT } from '../Constants/socketEvent';
import AlbumSchema from '../Entities/AlbumSchema';
import { AlbumInterface } from '../Interface/AlbumInterface';
import databaseService from './databaseService';
import drawingService from './drawingService';
import socketService from './socketService';


class AlbumService {

   public albums:Map<String,Album>;

   constructor() {
     this.albums=new Map<String,Album>();  // albumName and Album
     this.loadAllAlbum();
    }

   async loadAllAlbum() {
    this.albums.clear(); 
    await databaseService.getAllAlbums().then((albums)=>{
         albums.forEach((album)=>{
            let albumObj=new Album(album);
            this.albums.set(albumObj.getName(),albumObj);
         });
    }).catch((e:Error)=>{
        console.log(e);
    });
   }

   async createAlbum(albumToCreate:any) {
      let album=new AlbumSchema.albumSchema({
        albumName:albumToCreate.albumName,
        creator:albumToCreate.creator,
        drawings:albumToCreate.drawings,
        visibility:albumToCreate.visibility,
        dateCreation:albumToCreate.dateCreation,
        description:albumToCreate.description,
        members:albumToCreate.members,
        requests:albumToCreate.requests
      });

      let albumObj=new Album(album as AlbumInterface);

      try {
       await album.save().then(()=>{
         this.albums.set(albumObj.getName(),albumObj);
         const message={
           albumName:albumObj.getName()
         }
         socketService.getIo().emit(SOCKETEVENT.ALBUMCREATED,JSON.stringify(message));
       }).catch((e:Error)=>{
         console.log(e);
       });
      }
      catch(e) {
        console.log(e);
      }
   }

   async addRequest(newMember:String,albumName:String) {
     let album:Album=this.albums.get(albumName) as Album;
     album.addRequest(newMember);
     await this.updateMember(album);
   }

   async acceptRequest(request:String,albumName:String) {
      let album:Album=this.albums.get(albumName) as Album;
      album.addMember(request);
      album.removeRequest(request);
      await this.updateMember(album);
   }

   async addMemberToAlbum(albumName:String,newMember:String) {
     let album:Album=this.albums.get(albumName) as Album;
     album.addMember(newMember);
     await this.updateMember(album);
   }

   async removeMemberFromAlbum(albumName:String,member:String) {
     let album:Album=this.albums.get(albumName) as Album;
     album.removeMember(member);
     drawingService.drawings.forEach((v,k)=>{
       if(album.getDrawings().indexOf(k)!=-1) {
         v.setOwner(album.getCreator());
         drawingService.drawings[`${k}`]=v;
         drawingService.autoSaveDrawing(k);
       }
     })
     await this.updateMember(album)
   }

   async updateMember(album:Album) {
    try {
      const filter={albumName:album.getName()};
          const albumUpdate = {
            $set:{
              "members":album.getMembers(),
              "requests":album.getRequests()
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          }).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().then(()=>{
            this.albums[`${album.getName()}`]=album;

            let albumRes:AlbumInterface={
              albumName:album.getName(),
              creator:album.getCreator(),
              drawings:drawingService.convertAllDrawingToSourceName(album.getDrawings()),
              visibility:album.getVisibility(),
              dateCreation:album.getDateCreation(),
              description:album.getDescription(),
              members:album.getMembers(),
              requests:album.getRequests()
            }

            const message={album:albumRes};
            socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(message));
          }).catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
   }

   async deleteAlbum(name:String) {
     try {
      await AlbumSchema.albumSchema.deleteOne({albumName:name}).then((data)=>{
        console.log(data);
        let album:Album=this.albums.get(name) as Album;
        this.albums.delete(name);
        drawingService.drawings.forEach((v,k)=>{
          if(album.getDrawings().indexOf(k)!=-1) {
            drawingService.deleteDrawing(k);  // delete all drawings in album
          }
        });
        const message={albumName:album.getName()};
        socketService.getIo().emit(SOCKETEVENT.ALBUMDELETED,JSON.stringify(message));
      });
     }
     catch(e) {
       console.log(e);
     }
   }

  async updateAlbum(newName:String,albumName:String,description:String) {
    let album:Album=this.albums.get(albumName) as Album;
    let oldName:String=album.getName() as String;
    
    const filter={albumName:album.getName()};
    const albumUpdate = {
         $set:{
           "albumName":newName,
           "description":description
         }
     };
    try {
      let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
      await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
        console.log(e);
      });
      await albumDoc?.save().then(()=>{
        album.setName(newName);
        album.setDescription(description);
        this.albums.delete(oldName);
        this.albums.set(album.getName(),album);

        let albumRes:AlbumInterface={
          albumName:album.getName(),
          creator:album.getCreator(),
          drawings:drawingService.convertAllDrawingToSourceName(album.getDrawings()),
          visibility:album.getVisibility(),
          dateCreation:album.getDateCreation(),
          description:album.getDescription(),
          members:album.getMembers(),
          requests:album.getRequests()
        }

        const message={oldName:oldName,album:albumRes};
        socketService.getIo().emit(SOCKETEVENT.ALBUMNAMECHANGED,JSON.stringify(message));
      }).catch((e:Error)=>{
        console.log(e);
      });
    }
    catch(e) {
      console.log(e);
    }
  }

  async changeAlbumDescription(albumName:String,description:String) {
    try {
      const filter={albumName:albumName};
          const albumUpdate = {
            $set:{
              "description":description,
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().then(()=>{
            let album:Album=albumService.albums.get(albumName) as Album;
            album.setDescription(description);
            this.albums[`${albumName}`]=album;
            
            let albumRes:AlbumInterface={
              albumName:album.getName(),
              creator:album.getCreator(),
              drawings:drawingService.convertAllDrawingToSourceName(album.getDrawings()),
              visibility:album.getVisibility(),
              dateCreation:album.getDateCreation(),
              description:album.getDescription(),
              members:album.getMembers(),
              requests:album.getRequests()
            }

            const message={album:albumRes};
            socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(message));
          }).catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
  }

  async addDrawingToAlbum(drawingName:String,albumName:String) {
    this.albums.forEach(async (v,k)=>{
      if(v.getDrawings().indexOf(drawingName)!=-1) {
        v.removeDrawing(drawingName);
        await this.updateDrawingInAlbum(v);
      }
    });
    let album:Album=this.albums.get(albumName) as Album;
    album.addDrawing(drawingName);
    await this.updateDrawingInAlbum(album);
  }

  async updateDrawingInAlbum(album:Album) {
    try {
      const filter={albumName:album.getName()};
          const albumUpdate = {
            $set:{
              "drawings":album.getDrawings(),
            }
          };
          let albumDoc=await AlbumSchema.albumSchema.findOne(filter);
          await AlbumSchema.albumSchema.updateOne(filter,albumUpdate).catch((e:Error)=>{
            console.log(e);
          });
          await albumDoc?.save().then(()=>{
            this.albums[`${album.getName()}`]=album;
            
            let albumRes:AlbumInterface={
              albumName:album.getName(),
              creator:album.getCreator(),
              drawings:drawingService.convertAllDrawingToSourceName(album.getDrawings()),
              visibility:album.getVisibility(),
              dateCreation:album.getDateCreation(),
              description:album.getDescription(),
              members:album.getMembers(),
              requests:album.getRequests()
            }

            const message={album:albumRes};
            socketService.getIo().emit(SOCKETEVENT.ALBUMMODIFIED,JSON.stringify(message));
          }).catch((e:Error)=>{
            console.log(e);
          });
    }
    catch(e:any) {
      console.log(e);
    }
  }


}

const albumService=new AlbumService();
export default albumService;

