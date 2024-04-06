const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Userschema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        avatar_info: {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        },
        password: {
            type: String,
            required: true
        },
    }, { timestamps: true }
)

const Newuser = mongoose.model('User', Userschema)

module.exports = Newuser 