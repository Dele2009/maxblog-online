const mongoose = require('mongoose')
const Schema = mongoose.Schema

const blogschema = new Schema(
  {
    author: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    
    // snippet: {
    //   type: String
    // },
    heroimage: {
      type: String,
      required: true
    },
    blog: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const Blog = mongoose.model('Blog', blogschema)

module.exports = Blog
