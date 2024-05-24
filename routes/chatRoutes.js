import express from 'express'

// const upload = require('../middleware/upload')
import {
    chats,
    startnewchat,
    startchat
} from '../controllers/chat-controls.js'
import { requireLogin } from '../middleware/requirelogin.js'

export const chat_router = express.Router()


chat_router.get('/', requireLogin, chats);
chat_router.post('/startNewChat', requireLogin, startnewchat)
chat_router.get('/:id', requireLogin, startchat);


