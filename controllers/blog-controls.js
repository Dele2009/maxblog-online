//const Blog = require('../models/blog')
const Newblogs = require('../models/newblogs')
const cloudinary = require('../middleware/cloudinary')
const { formatDistanceToNow } = require('date-fns')











const get_blogs = async (req, res) => {
  try {
    // const result = await Blog.find()
    const result = await Newblogs.find().sort({ createdAt: -1 })

    res.render('test', { title: 'Home', Blogs: result,formatDistanceToNow: formatDistanceToNow, })
  } catch (error) {
    console.log(error)
  }
}


const get_a_blog = async (req, res) => {
  const id = req.params.id
  console.log(id)
  try {
    // const result = await Blog.findById(id)
    const result = await Newblogs.findById(id)
    res.render('blogView', { title: 'blog Details', Blog: result })
  } catch (error) {
    console.log(error)
  }
}



const get_blog_category = async (req, res) => {
  const id = req.params.id
  console.log(id)
  try {
    // const result = await Blog.findById(id)
    const result = await Newblogs.find({ category: id })
    res.render('blogcategory', { title: `${id}`, Blogs: result })
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