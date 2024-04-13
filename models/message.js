const mongoose = require('mongoose');
const Schema = mongoose.Schema

const date = new Date()
const hour = date.getHours()
const minute = date.getMinutes()
const newMinute = minute < 10 ? "0" + minute : minute
const md = hour < 12 ? "am" : "pm";
const newHour = hour > 12 ? hour - 12 : hour

const messageSchema = new Schema({
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    message: { 
        type: String, 
        required: true 
    },
    conversationId:{
        type:String,
        required:true
    },
    time:{
        type: String, 
        default: `${newHour}:${newMinute} ${md}`
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

const Messages = mongoose.model('Message', messageSchema);
module.exports = Messages