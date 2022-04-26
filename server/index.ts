import express from 'express';
import http from 'http';
import sampleRouter from './ping'
import userData from './userData';
import userController from './Controllers/userController';
import chatMessageController from './Controllers/chatMessageController';
import socketService from './Services/socketService';
import roomController from './Controllers/roomController';
import drawingController from './Controllers/drawingController';
import albumController from './Controllers/albumController';
import imageController from './Controllers/imageController';


const app = express();

app.set('PORT', process.env.PORT ||8080);

app.use(express.json({limit:"10mb"}));

app.use((req, res, next) => {   // must be here to make http request work without access problems
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
  
app.use('',sampleRouter)
app.use('',userData)

/*********User ***********/
app.use('/user',userController);
app.use('/message',chatMessageController);
app.use('/room',roomController);
app.use('/drawing',drawingController);
app.use('/album',albumController);


app.use('/image',imageController);

const server = http.createServer(app); // server for http


socketService.init(server);

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running localhost:${app.get('PORT')}`);
});

