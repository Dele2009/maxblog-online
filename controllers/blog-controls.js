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
    const perPage = 6;
    let user;
    if (req.session && req.session.user) {
      user = req.session.user
    }
    const totalCount = await Newblogs.countDocuments();

    // // Calculate total number of pages
    const totalPages = Math.ceil(totalCount / perPage);
    const skip = Number((page - 1) * perPage)
    const limit = Number(perPage)
    const result = await Newblogs.find()
    const sliderBlogs = result.slice(0, 4).sort((a, b) => b.createdAt - a.createdAt)
    const allresults = result.sort((a, b) => a.createdAt - b.createdAt)
                              .slice(skip, skip + limit)

    const newresults = result.slice().sort((a, b) => b.createdAt - a.createdAt)

    res.render('index', {
      title: 'Home',

      Blogs: allresults,
      totalCount,
      currentPage: page,
      totalPages,
      contentPerPage: perPage,

      newBlogs: newresults,
      slideBlogs: sliderBlogs,
      formatDistanceToNow,
      user,
      row: "6"
      // currentPage: page,
      // totalPages: totalPages
    })

  } catch (error) {
    console.log(error)
  }
}


const get_a_blog = async (req, res) => {
  const id = req.params.id
  let user;
  if (req.session && req.session.user) {
    user = req.session.user
  }
  console.log(id)
  try {
    // const result = await Blog.findById(id)
    const requestedBlog = await Newblogs.findById(id)
    const result = await Newblogs.find()
    const newresults = result.slice().sort((a, b) => b.createdAt - a.createdAt)
    res.render('blogView',
      {
        title: 'blog Details',
        Blog: requestedBlog,
        newBlogs: newresults,
        user
      }
    )
  } catch (error) {
    console.log(error)
  }
}



const get_blog_category = async (req, res) => {
  const id = req.params.id
  const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
  const perPage = 10; // Number of blogs per page
  let user;
  if (req.session && req.session.user) {
    user = req.session.user
  }
  console.log(id)
  try {
    // const result = await Blog.findById(id)
    const totalCount = await Newblogs.countDocuments({ category: id });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalCount / perPage);
    const result = await Newblogs.find({ category: id }).sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.render('blogcategory',
      {
        title: `${id}`,
        Blogs: result,
        user,
        formatDistanceToNow,
        totalCount,
        currentPage: page,
        totalPages: totalPages,
        contentPerPage: perPage,
        row: "4"
      }
    )
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