const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const dompurifier = require('dompurify')
// const { JSDOM } = require('jsdom')
// const htmlpurify = dompurifier(new JSDOM().window)


const stripHtml = import('string-strip-html')


const blogschema = new Schema(
  {
    author: {
      type: String,
      required: true
    },
    author_id: {
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
    heroimage_info: {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    },
    blog: {
      type: String,
      required: true
    }

  },
  { timestamps: true }
)

// blogschema.pre('validate', next => {
//   if (this.blog) {
//     this.blog = htmlpurify.sanitize(this.blog)
//     this.snippet= stripHtml(this.blog.substring(0,200)).result
//   }
//   next()
// })
const Newblogs = mongoose.model('newblog', blogschema)

module.exports = Newblogs
