const mongoose = require('mongoose');
const Schema = mongoose.Schema



const messageSchema = new Schema({
    senderId: { 
        type:String,
        required:true
    },
    receiverId: { 
        type:String,
        required:true
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
        required:true
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

const Messages = mongoose.model('Message', messageSchema);
module.exports = Messages