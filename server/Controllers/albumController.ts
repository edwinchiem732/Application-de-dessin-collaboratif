import express, { NextFunction, Request, Response }  from "express";
import { Album } from "../class/Album";
import { Drawing } from "../class/Drawing";
import { HTTPMESSAGE } from "../Constants/httpMessage";
import { VISIBILITY } from "../Constants/visibility";
import { AlbumInterface } from "../Interface/AlbumInterface";
import { DrawingInterface } from "../Interface/DrawingInterface";
import { ProtectedDrawingInterface } from "../Interface/ProtectedDrawingInterface";
import albumService from "../Services/albumService";
import drawingService from "../Services/drawingService";
import userService from "../Services/userService";


const router = express.Router();

const createAlbum=async (req:Request,res:Response,next:NextFunction)=>{
    let albumName:String=req.body.albumName as String;
    let creator:String=req.body.creator as String;
    let drawings:Drawing[]=[];
    let visibility:String=req.body.visibility as String;
    let dateCreation:Number=Date.now();
    let description:String=req.body.description;
    let members:String[]=[];
    let requests:String[]=[];

    if(visibility==VISIBILITY.PRIVATE) {
      members.push(creator);
    }
    if(visibility==VISIBILITY.PUBLIC) {
      userService.getUsers().forEach((user)=>{
        members.push(user.getUseremail());
      })
    }

    if(!description) {
        description="";
    }

    let album={
        albumName:albumName,
        creator:creator,
        drawings:drawings,
        visibility:visibility,
        dateCreation:dateCreation,
        description:description,
        members:members,
        requests:requests
    };

    if(albumService.albums.has(album.albumName)) {
        return res.status(404).json({message:HTTPMESSAGE.ALBUMEXIST});
    }

    if(album.albumName && album.creator && album.visibility) {
      albumService.createAlbum(album);
      return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
    return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const getAlbums=(req:Request,res:Response,next:NextFunction)=>{
    let albums:AlbumInterface[]=[];
    albumService.albums.forEach((v,k)=>{
      let album:AlbumInterface={
        albumName:v.getName(),
        creator:v.getCreator(),
        drawings:drawingService.convertAllDrawingToSourceName(v.getDrawings()),
        visibility:v.getVisibility(),
        dateCreation:v.getDateCreation(),
        description:v.getDescription(),
        members:v.getMembers(),
        requests:v.getRequests()
      } 
      albums.push(album);
    });
    return res.status(200).json(albums);
}

const deleteAlbum=(req:Request,res:Response,next:NextFunction)=>{
    let albumName:String=req.body.albumName as String;
    let useremail:String=req.body.useremail as String;
    if(albumService.albums.has(albumName)) {
      if(albumService.albums.get(albumName)?.getCreator()==useremail) {
        albumService.deleteAlbum(albumName);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
      }
      return res.status(404).json({message:HTTPMESSAGE.UNOPERMISSION});
    }
    return res.status(404).json({message:HTTPMESSAGE.ANOTFOUND});
}

const joinAlbum=async(req:Request,res:Response,next:NextFunction)=>{
   
   let albumName:String=req.body.albumName as String;
   let useremail:String=req.body.useremail as String;
   if(albumService.albums.has(albumName)) {
     if(albumService.albums.get(albumName)?.getMembers().indexOf(useremail)!=-1) {
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
     }
     return res.status(404).json({message:HTTPMESSAGE.UNOPERMISSION});
   }
   return res.status(404).json({message:HTTPMESSAGE.FAILED});
}

const addRequestToAlbum=(req:Request,res:Response,next:NextFunction)=>{
  let newMember:String=req.body.newMember as String;
  let albumName:String=req.body.albumName as String;

  if(userService.getUsers().find((user)=>user.getUseremail()==newMember)) {
    if(albumService.albums.has(albumName)) {
        albumService.addRequest(newMember,albumName)
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
    return res.status(404).json({message:HTTPMESSAGE.ANOTFOUND});
  }
  return res.status(404).json({message:HTTPMESSAGE.UNOTFOUND});
}

const acceptRequestInAlbum=(req:Request,res:Response,next:NextFunction)=>{
  let useremail:String=req.body.useremail as String;
  let albumName:String=req.body.albumName as String;
  let request:String=req.body.request as String;

  if(albumService.albums.get(albumName)?.getRequests().indexOf(request)==-1) {
    return res.status(404).json({message:HTTPMESSAGE.REQNOTFOUND});
  } 

  if(albumService.albums.has(albumName)) {
    if(albumService.albums.get(albumName)?.getMembers().indexOf(useremail)!=-1) {
      albumService.acceptRequest(request,albumName);
      return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
    return res.status(404).json({message:HTTPMESSAGE.UNOPERMISSION});
  }
  return res.status(404).json({message:HTTPMESSAGE.ANOTFOUND});

}

const leaveAlbum=(req:Request,res:Response,next:NextFunction)=>{
   let albumName:String=req.body.albumName as String;
   let visibility:String=albumService.albums.get(albumName)?.getVisibility() as String;
   let member:String=req.body.member as String;

   if(visibility==VISIBILITY.PUBLIC) {
     return res.status(404).json({message:HTTPMESSAGE.UNOPERMISSION});
   }
    
   if(albumService.albums.has(albumName)) {
     let album:Album=albumService.albums.get(albumName) as Album;
     if(album.getMembers().indexOf(member)!=-1) {
       if(album.getCreator()==member) {
         return res.status(404).json({message:HTTPMESSAGE.UISOWNER});
       }
       albumService.removeMemberFromAlbum(albumName,member);
       return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
     }
     return res.status(404).json({message:HTTPMESSAGE.UNOTFOUND});
   }
   return res.status(404).json({message:HTTPMESSAGE.ANOTFOUND});
}

const updateAlbum=async (req:Request,res:Response,next:NextFunction)=>{
  let useremail:String=req.body.useremail as String;  
  let albumName:String=req.body.album.albumName as String;
  let description:String=req.body.album.description as String;

  if(albumService.albums.has(albumName)) {
    if(albumService.albums.get(albumName)?.getCreator()==useremail) {
        if(req.body.newName!==undefined) {
          let newName:String=req.body.newName;
          if(albumService.albums.has(newName)) {
            return res.status(404).json({message:HTTPMESSAGE.ALBUMEXIST});
          }
          await albumService.updateAlbum(newName,albumName,description);
          return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
        }
        albumService.changeAlbumDescription(albumName,description);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
    }
      return res.status(404).json({message:HTTPMESSAGE.UNOPERMISSION});
  }
  return res.status(404).json({message:HTTPMESSAGE.FAILED});
}


const addDrawing=async (req:Request,res:Response,next:NextFunction)=>{
    let drawingName:String=drawingService.addonDrawingName(req.body.drawingName) as String;
    let useremail:String=req.body.useremail as String;
    let albumName:String=req.body.albumName as String;

    if(albumService.albums.has(albumName)==false) {
      return res.status(404).json({message:HTTPMESSAGE.ANOTFOUND});
    }

    if(drawingService.drawings.has(drawingName)) {
      if(drawingService.drawings.get(drawingName)?.getOwner()!=useremail) {
        return res.status(404).json({message:HTTPMESSAGE.UNOPERMISSION});
      }
      if(albumService.albums.get(albumName)?.getMembers().indexOf(useremail)!=-1) {
        await albumService.addDrawingToAlbum(drawingName,albumName);
        return res.status(200).json({message:HTTPMESSAGE.SUCCESS});
      }
      return res.status(404).json({message:HTTPMESSAGE.UNOPERMISSION});
    }
    return res.status(404).json({message:HTTPMESSAGE.DNOTFOUND});
}

const getDrawingsFromAlbum=(req:Request,res:Response,next:NextFunction)=>{
    let albumName:String=req.params.albumName as String;
    let drawings:DrawingInterface[]=[];
    if(albumService.albums.has(albumName)) {
      let album:Album=albumService.albums.get(albumName) as Album;
      album.getDrawings().forEach((drawingName)=>{
        if(drawingService.drawings.get(drawingName)?.getVisibility()==VISIBILITY.PUBLIC || drawingService.drawings.get(drawingName)?.getVisibility()==VISIBILITY.PRIVATE) {
          let drawing:Drawing=drawingService.drawings.get(drawingName) as Drawing;
          let drawingInterface:DrawingInterface={
            drawingName:drawingService.sourceDrawingName(drawing.getName()),
            owner:drawing.getOwner(),
            elements:drawing.getElementsInterface(),
            roomName:drawing.roomName,
            members:drawing.getMembers(),
            visibility:drawing.getVisibility(),
            creationDate:drawing.getCreationDate(),
            likes:drawing.getLikes()
          }
         drawings.push(drawingInterface);
        }
        if(drawingService.drawings.get(drawingName)?.getVisibility()==VISIBILITY.PROTECTED) {
          let drawing=drawingService.drawings.get(drawingName);
          let drawingInterface:ProtectedDrawingInterface={
            drawingName:drawingService.sourceDrawingName(drawing.getName()),
            owner:drawing.getOwner(),
            elements:drawing.getElementsInterface(),
            roomName:drawing.roomName,
            members:drawing.getMembers(),
            visibility:drawing.getVisibility(),
            creationDate:drawing.getCreationDate(),
            likes:drawing.getLikes(),
            password:drawing.password
          }
          drawings.push(drawingInterface);
        }
      });
      return res.status(200).json(drawings);
    } 
    return res.status(404).json({message:HTTPMESSAGE.ANOTFOUND});  
   
}



router.post('/createAlbum',createAlbum);
router.get('/getAlbums',getAlbums);
router.post('/deleteAlbum',deleteAlbum);
router.post('/joinAlbum',joinAlbum);
router.post('/addRequest',addRequestToAlbum);
router.post('/acceptRequest',acceptRequestInAlbum);
router.post('/leaveAlbum',leaveAlbum);
router.post('/updateAlbum',updateAlbum);

router.post('/addDrawing',addDrawing);
router.get('/getDrawings/:albumName',getDrawingsFromAlbum);

export=router;