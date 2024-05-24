import express from 'express'

import {upload} from '../middleware/upload.js'
import {
  get_blogs,
  get_a_blog,
  get_blog_category,
  delete_blog
} from '../controllers/blog-controls.js'

export const router = express.Router()

router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' })
})


//get all blogs
router.get('/all-blogs', get_blogs)

//get blog by id
router.get('/:id', get_a_blog)

router.get('/category/:id', get_blog_category)

router.delete('/:id', delete_blog)


