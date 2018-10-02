const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')

const indexRouter = require('./routes/index')


const app = express()
app.locals.pretty = true
const sqlite = require('sqlite')
const dbPromise = sqlite.open("./BBS_test.db", {Promise})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser('pppasdqwkmcworpw'))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

app.use(session({
  secret:"my app secret",
  saveUninitialized: false,
  resave : true,
  cookie : {
        maxAge : 1000 * 60, // 设置 session 的有效时间，单位毫秒
  },
}))

app.use(async (req, res, next) => {
  req.user = await db.get('SELECT * FROM users WHERE id= ?', req.signedCookies.userID)
  req.contentID = req.signedCookies.contentID
  next()
})

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

;
(async () => {
  global.db = await dbPromise
  app.listen(8088, () => console.log("8088端口监听成功！"))
})()


module.exports = app
