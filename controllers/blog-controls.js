//const Blog = require('../models/blog')
const Newblogs = require('../models/newblogs')
const cloudinary = require('../middleware/cloudinary')
const {
  getFolder,
  uploadFile
} = require('../middleware/googledrive')
const { formatDistanceToNow } = require('date-fns')











const get_blogs = async (req, res) => {
  try {
    // const result = await Blog.find()
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
    const perPage = 2; // Number of blogs per page
    let user;
    if(req.session && req.session.user){
      user = req.session.user
    }
    const totalCount = await Newblogs.countDocuments();
    
    // Calculate total number of pages
    const totalPages = Math.ceil(totalCount / perPage);
    const result = await Newblogs.find().sort({ createdAt: -1 }).skip((page - 1) * perPage)
      .limit(perPage);

    res.render('index', { 
      title: 'Home', 
      Blogs: result,
      formatDistanceToNow, 
      user,
      currentPage: page,
      totalPages: totalPages
    })

  } catch (error) {
    console.log(error)
  }
}


const get_a_blog = async (req, res) => {
  const id = req.params.id
  let user;
    if(req.session && req.session.user){
      user = req.session.user
    }
  console.log(id)
  try {
    // const result = await Blog.findById(id)
    const result = await Newblogs.findById(id)
    res.render('blogView', { title: 'blog Details', Blog: result, user })
  } catch (error) {
    console.log(error)
  }
}



const get_blog_category = async (req, res) => {
  const id = req.params.id
  let user;
    if(req.session && req.session.user){
      user = req.session.user
    }
  console.log(id)
  try {
    // const result = await Blog.findById(id)
    const result = await Newblogs.find({ category: id })
    res.render('blogcategory', { title: `${id}`, Blogs: result, user, formatDistanceToNow })
  } catch (error) {
    console.log(error)
  }
}


const delete_blog = async (req, res) => {
  const id = req.params.id
  console.log(id)
  try {
    // const result = await Blog.findById(id)
    await Newblogs.findByIdAndDelete(id)
    res.json({ redirect: '/' })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  get_blogs,
  get_a_blog,
  get_blog_category,
  delete_blog
}