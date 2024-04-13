const express = require('express')

// const upload = require('../middleware/upload')
const chatcontrols = require('../controllers/chat-controls')
const requireLogin = require('../middleware/requirelogin')

const chat_router = express.Router()


chat_router.get('/',requireLogin, chatcontrols.chats );
chat_router.get('/:id',requireLogin, chatcontrols.startchat );

module.exports= {chat_router}