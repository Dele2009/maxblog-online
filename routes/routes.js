const express = require('express')

const upload = require('../middleware/upload')
const blogcontrols = require('../controllers/blog-controls')

const router = express.Router()

router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' })
})


//get all blogs
router.get('/all-blogs', blogcontrols.get_blogs)

//get blog by id
router.get('/:id', blogcontrols.get_a_blog)

router.get('/category/:id', blogcontrols.get_blog_category)

router.delete('/:id', blogcontrols.delete_blog)

module.exports = { router }
