import express,{ NextFunction, Request, Response } from "express";
import { uploadFile } from "../image/firebase";


const router = express.Router();

const uploadImage=async (req:Request,res:Response,next:NextFunction)=>{
     console.log("hello");
    let link = req.body.image;
    console.log(link)

    if(Array.isArray(link)) {
        let buffer = Buffer.from(req.body.image)
        await uploadFile(req.body.name, buffer)
        .then(async (res) => { link = res as string
           console.log(link);
        })
        .catch((err) => {
          console.log(err)
        })
    }
    /*console.log("image");
    console.log(req['file']);
    if(req['file']) {
        console.log(req['file'].thumbnail)
        return res.json("image")
    }
    return res.json("jhbiu");
    */
}


router.post('/upload',uploadImage)

export=router;
