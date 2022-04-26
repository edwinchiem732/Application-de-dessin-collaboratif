import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

const ping = (req: Request, res: Response, next: NextFunction) => {  
    console.log('received a ping !')
    return res.status(200).json({
        title:"Authorized",
        message: "pong"
    });
};


router.get('/ping', ping)

export = router;