const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
require('dotenv').config()
const Message = require('./models/message')

const { router } = require('./routes/routes')
const { user_router } = require('./routes/userRoutes')
const { chat_router } = require('./routes/chatRoutes')

const port = process.env.App_Port || 4000;
//deployment key
// const mongo_url = process.env.Mongo_Url
//teting phase

const mongo_url = 'mongodb://localhost:27017'
//Production key


const app = express()
const server = http.createServer(app);
const io = socketIo(server);


mongoose
  .connect(mongo_url)
  .then(result => console.log('database conected'))
  .catch(err => console.log('Error Detected' + '=>' + err))

//using the ejs template to render
app.set('view engine', 'ejs')
app.set('views', 'pages')

//serving static documents

app.use(express.json({ limit: '100mb' }))//Adjust limit as need
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
// app.use('/uploads',express.static('uploads'))
app.use(morgan('dev'))

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

const userSockets = {};
io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  socket.on('setUser', (userId) => {
    // Associate username with socket
    userSockets[userId] = socket.id;
    console.log(`User ${userId} connected`);
    console.log(userSockets)
  });
  
  // socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
  //   try {
  //     // Save message to database
  //     const message = new Message({ sender: senderId, receiver: receiverId, content });
  //     await message.save();
      
  //     // Emit the message to the receiver
  //     io.to(receiverId).emit('newMessage', { senderId, content });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  socket.on('sendMessage', async (messageData) => {
    try {
      console.log('Message received:', messageData);
      const { senderId, receiverId, message } = messageData;
      const conversationId = generateConversationId(senderId, receiverId);
      const newMessage = new Message({ senderId, receiverId, message, conversationId });
      await newMessage.save();
      console.log(newMessage)
      const recipients = [senderId, receiverId];
      // Emit the message only to the sockets of the recipients
     
        io.to(userSockets[receiverId]).emit('receiveMessage', newMessage);
      
     
        io.to(userSockets[senderId]).emit('receiveMessage', newMessage);
     

      // Emit the message to the receiver's socket
      
      // io.emit('receiveMessage', ); // Send message to sender and receiver
    } catch (err) {
      console.error(err);
    }
  })
});

function generateConversationId(sender, receiver) {
  const participants = [sender, receiver].sort();
  return participants.join('_');
}


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
app.use('/chats',chat_router)

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


