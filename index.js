import './dirname.js'
import path from 'path'
import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import http from 'http'
import {Server} from 'socket.io'
import session from 'express-session'

import MongoDBSessionStore from  'connect-mongodb-session'

import dotenv from "dotenv"
dotenv.config();

import {
  generateSharedKey,
  encryptMessage,
  decryptMessage
} from "./middleware/encryption.js"

import {
  Messages
} from './models/message.js'

import {Newuser} from './models/User.js'
import { generateConversationId } from './middleware/generatechatid.js'

import { router } from './routes/routes.js'
import { user_router } from './routes/userRoutes.js'
import { chat_router } from './routes/chatRoutes.js'

const port = process.env.App_Port || 4000;
//deployment key
//const mongo_url = process.env.Mongo_Url;
//teting phase

//const mongo_url = 'mongodb://localhost:27017/maxblogs'
const mongo_url = 'mongodb://localhost:27017/'

//Production key


const app = express();
const server = http.createServer(app);
const io = new Server(server);


mongoose
  .connect(mongo_url)
  .then((result) => 
    {
     console.log('database connected');
    //  console.log(result)
    }
  )
  .catch(err => console.log('Error Detected' + ' => ' + err));

const expiration =   process.env.Session_expiration
console.log(expiration)


const MongoDBStore = MongoDBSessionStore(session);
const store = new MongoDBStore({
  uri: mongo_url,
  collection: 'sessions',
  expires: (24*3)*60*60*1000
});

app.use(session({
  secret: process.env.Session_secret,
  resave: false,
  saveUninitialized: true,  
  store: store,
  cookie: {
    maxAge: (24*3)*60*60*1000
  }
}));

//using the ejs template to render
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
console.log(__dirname)

//serving static documents

app.use(express.json({ limit: '100mb' }))//Adjust limit as need
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
// app.use('/uploads',express.static('uploads'))
app.use(morgan('dev'))








const userSockets = {};
let userid,recieverid;
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // socket.on('saveKeys',async ({userId , publicKey})=>{
  //    const userkey = new keys({userId , publicKey})
  //    await userkey.save()
  // })

  socket.on('setUser', (userId) => {
    // Associate userId with socket
    userSockets[userId] = socket.id;
    console.log(`User ${userId} connected`);
    console.log(userSockets)
    // const recipient = keys.findOne({userId:receiverId })
    // if(recipient){
    //   const recipientPublicKey = recipient.publicKey;
    //   socket.emit("keyTransferProtocol", recipientPublicKey)
    // }

  });

  



 
  socket.on('sendMessage', async (messageData) => {
    try {
      console.log('Message received:', messageData);
      const { senderId, receiverId, message, time } = messageData;
      userid = senderId
      recieverid = receiverId
      const SU_EK_0 = generateSharedKey(senderId, receiverId)
      const encryptedMessage = encryptMessage(message, SU_EK_0);

      const conversationId = generateConversationId(senderId, receiverId);
      const newMessage = new Messages(
        { 
          senderId, 
          receiverId, 
          message:encryptedMessage, 
          conversationId, 
          time 
        }
      );
      await newMessage.save();
      console.log(newMessage)
      // Emit the message only to the sockets of the recipients

      io.to(userSockets[receiverId]).emit('receiveMessage', newMessage);


      // io.to(userSockets[senderId]).emit('receiveMessage', newMessage);


      // Emit the message to the receiver's socket

      // io.emit('receiveMessage', ); // Send message to sender and receiver
    } catch (err) {
      console.error(err);
    }
  })

  socket.on('decryptMessage', (data) => {
    const messageData = data
    const SU_EK_0 = generateSharedKey(messageData.senderId, messageData.receiverId)

    const decryptedMessage = decryptMessage(messageData.message, SU_EK_0);
    messageData.message = decryptedMessage

      io.to(userSockets[data.receiverId]).emit('decryptedMessage', messageData);


      // io.to(userSockets[data.senderId]).emit('decryptedMessage', messageData);
    // io.emit('decryptedMessage', messageData);
  });
});






// app.use(csrf());

// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });




//geting all data from database using mongodb mongoose

app.get('/', (req, res) => {
  res.redirect('/blogs/all-blogs')
})

app.use('/blogs', router)
app.use('/user', user_router)
app.use('/chats', chat_router)
app.use((req,res)=>{
  res.render("404",{title:"Error: 404"})
})

// app.use((error,req,res,next)=>{
//   console.error(error.stack)
//   res.render("404")
// })

// app.use((req, res, next) => {
//   if (req.session && !req.session.user) {
//     // If session exists but user is not logged in, redirect to login page
//     res.redirect('/user/log-in');
//   }
//   next();
// });

server.listen(port, () => {
  console.log('App running on localhost:', port)
})




