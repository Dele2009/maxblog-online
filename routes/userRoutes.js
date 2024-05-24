import express from 'express'

import {upload} from '../middleware/upload.js'

import {
    sign_up,
    tokenVerify,
    updatePassword,
    log_in,
    Show_user_dashboard,
    get_user_blogInfo,
    load_blogCreate,
    create_blog,
    user_Authored_blogs,
    log_out
} from '../controllers/user-controls.js'

import {requireLogin} from '../middleware/requirelogin.js'

export const user_router = express.Router()


user_router.get('/sign-up', (req, res) => {
    res.render('Signup', { title: 'Sign Up' })
})

user_router.post('/sign-up',upload.single('avatar'), sign_up )

user_router.get('/verify', (req, res) => {
    const {email} = req.query
    res.render('verify', { title: 'verification', email })
})

user_router.put("/verify", tokenVerify)

user_router.get('/log-in',  (req, res) => {
    res.render('Login', { title: 'Login' })
})

user_router.get('/reset-password',  (req, res) => {
    res.render('resetPassword', { title: 'Reset password' })
})

user_router.put('/reset-password', updatePassword)

user_router.post('/log-in', log_in)

user_router.get('/dashboard', requireLogin, Show_user_dashboard);

user_router.get('/dashboard/getBloginfo', requireLogin, get_user_blogInfo)

user_router.get('/dashboard/create-blog', requireLogin, load_blogCreate )

user_router.post('/dashboard/create-blog',requireLogin, upload.single('heroimage'), create_blog)

user_router.get('/dashboard/Authored-blogs',requireLogin,user_Authored_blogs)

user_router.get('/log-out', log_out)


