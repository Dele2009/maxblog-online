const express = require('express')

const upload = require('../middleware/upload')
const usercontrols = require('../controllers/user-controls')
const requireLogin = require('../middleware/requirelogin')

const user_router = express.Router()


user_router.get('/sign-up', (req, res) => {
    res.render('Signup', { title: 'Sign Up' })
})

user_router.post('/sign-up',upload.single('avatar'), usercontrols.sign_up )

user_router.get('/verify', (req, res) => {
    res.render('verify', { title: 'verification' })
})

user_router.put("/verify", usercontrols.tokenVerify)

user_router.get('/log-in',  (req, res) => {
    res.render('Login', { title: 'Login' })
})

user_router.get('/reset-password',  (req, res) => {
    res.render('resetPassword', { title: 'Reset password' })
})

user_router.put('/reset-password', usercontrols.updatePassword)

user_router.post('/log-in', usercontrols.log_in)

user_router.get('/dashboard', requireLogin, usercontrols.Show_user_dashboard);

user_router.get('/dashboard/getBloginfo', requireLogin, usercontrols.get_user_blogInfo)

user_router.get('/dashboard/create-blog', requireLogin, usercontrols.load_blogCreate )

user_router.post('/dashboard/create-blog',requireLogin, upload.single('heroimage'), usercontrols.create_blog)

user_router.get('/log-out', usercontrols.log_out)


module.exports= {user_router}