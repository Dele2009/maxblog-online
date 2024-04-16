const Newuser = require('../models/User')
const Newblogs = require('../models/newblogs')
const Message = require('../models/message')


const chats = async (req, res) => {
    try {

        const user = req.session.user;
        // const users = await Newuser.find()
        const senders = await Message.distinct('senderId', { receiverId: user._id });
        const receivers = await Message.distinct('receiverId', { senderId: user._id });
    
        // Combine and deduplicate sender and receiver IDs
        const usersChattedWith = [...new Set([...senders, ...receivers])];
        console.log(usersChattedWith)
        const users = await Newuser.find({ _id: { $in: usersChattedWith } });
        console.log("chatted users"," =>", users )
        // const user = await Newuser.findById(userId)
        //const user = await User.findById(userId).populate('authoredBlogs');
        // if (!user) {
        //     throw new Error('User not found');
        // }
        // else {
        //     
        // }
        res.render('components/user/chats', { title: 'Chats', User: user,users });

    } catch (error) {
        return res.status(500).send('Error fetching chats: ' + error.message);
    }
}

const startnewchat =  async (req, res) => {
    try {
        const {email} = req.body
        const Recipient = await Newuser.findOne({email})
        const id = Recipient._id

        res.redirect(`/chats/${id}`)

        // const user = req.session.user;
        // const receiver_id = req.params.id;
        // const Recipient = await Newuser.findById(receiver_id)
        // const conversationId = generateConversationId(user._id, Recipient._id);
        // const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
        //const user = await User.findById(userId).populate('authoredBlogs');
        // if (!user) {
        //     throw new Error('User not found');
        // }
        // else {
        //     
        // }
        // res.render('components/user/chatpage', { title: 'Chats', User: user, Recipient,messages });

    } catch (error) {
        return res.status(500).send('Error fetching chats: ' + error.message);
    }
}

const startchat = async (req, res) => {
    try {

        const user = req.session.user;
        const receiver_id = req.params.id;
        const Recipient = await Newuser.findById(receiver_id)
        const conversationId = generateConversationId(user._id, Recipient._id);
        const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
        //const user = await User.findById(userId).populate('authoredBlogs');
        // if (!user) {
        //     throw new Error('User not found');
        // }
        // else {
        //     
        // }
        res.render('components/user/chatpage', { title: 'Chats', User: user, Recipient,messages });

    } catch (error) {
        return res.status(500).send('Error fetching chats: ' + error.message);
    }
}

function generateConversationId(sender, receiver) {
    const participants = [sender, receiver].sort();
    return participants.join('_');
  }

module.exports = {
    chats,
    startchat,
    startnewchat
}