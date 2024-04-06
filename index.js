const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const csrf = require('csurf')
const session = require('express-session');
require('dotenv').config()
const { router } = require('./routes/routes')
const { user_router } = require('./routes/userRoutes')

const port = process.env.App_Port || 4000;
//deployment key
const mongo_url = process.env.Mongo_Url
//teting phase

//Production key


const app = express()
mongoose
  .connect(mongo_url)
  .then(result => console.log('database conected'))
  .catch(err => console.log('Error Detected' + '=>' + err))

//using the ejs template to render
app.set('view engine', 'ejs')
app.set('views', 'pages')

//serving static documents

app.use(express.json({ limit: '100mb' }))//Adjust limit as need
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
// app.use('/uploads',express.static('uploads'))
app.use(morgan('dev'))

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));


// app.use(csrf());

// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });




//geting all data from database using mongodb mongoose

app.get('/', (req, res) => {
  res.redirect('/blogs/all-blogs')
})

app.use('/blogs', router)
app.use('/user', user_router)

app.use((req, res, next) => {
  if (req.session && !req.session.user) {
    // If session exists but user is not logged in, redirect to login page
    res.redirect('/user/log-in');
  }
  next();
});

app.listen(port, () => {
  console.log('App running on localhost:', port)
})


