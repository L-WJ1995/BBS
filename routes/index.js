const express = require('express')
const svgCaptcha = require('svg-captcha')
const router = express.Router()

/* GET home page. */
router.get('/', async function(req, res, next) {      //登录中转
  if(req.session && req.session.login) {
    let datas = await db.all('SELECT * FROM contents ORDER BY id DESC')
    res.render("home", {user:req.user, datas})
  }
  else {
    if (req.signedCookies.userID - 0 >= 0) {
      let findUser = await db.get('SELECT id FROM users WHERE id = ?', req.signedCookies.userID)
      if (findUser) {
        req.session.login = true
        req.session.userID = findUser.id
        let datas = await db.all('SELECT * FROM contents ORDER BY id DESC')
        res.render("home", {user:req.user, datas})
      } else {
        res.clearCookie('userID')
        res.redirect('/')
      }
    } else res.render("index")
  }
})

router.get('/captcha', function(req, res, next) {   //发送验证码
  let captcha = svgCaptcha.createMathExpr({noise:3, color:true, height:33.9, width:80,})
  req.session.captcha = captcha.text.toUpperCase()
  req.session.latsCaptchaTime = Date.now()
  console.log(req.session.captcha)
  console.log(req.session.latsCaptchaTime)
  res.type('svg')
  res.json({status:200, result:captcha.data, msg:"验证码"})
})

router.post('/registerORlogin', async (req, res, next) => {     //登录或注册
  req.session.latsCaptchaTime = req.session.latsCaptchaTime || Date.now()
  if (Date.now() - req.session.latsCaptchaTime > 180000)  {
    console.log("验证码超时")
    return res.json({status:205, type:req.body.type, msg:"验证码超时"})
  }

  if (req.body.captcha !== req.session.captcha) {
    console.log("验证码错误")
    return res.json({status:203, type:req.body.type, msg:"验证码错误"})
  }

  let cookieConfig = req.body.keepLogin 
                    ? {maxAge: 60 * 1000 * 24 * 60 * 30, httpOnly: true, signed: true} 
                    : {httpOnly: true, signed: true}

  if (req.body.type === "register") {
    let findUser = await db.get('SELECT name FROM users WHERE name = ?', req.body.username)
    if (findUser) return res.json({status:201, type:req.body.type, msg:"用户名已存在"})
    else {
      await db.run('INSERT INTO users (name, password, avatarPath) VALUES (?,?,?)', 
        req.body.username, 
        req.body.password,
        req.body.avatar)
      let user = await db.get('SELECT * FROM users WHERE name = ?', req.body.username)
      res.cookie('userID', user.id, cookieConfig)
      req.session.login = true
      req.session.userID = user.id
      res.json({status:100, type:req.body.type, msg:"注册成功"})
    }
  }

  if (req.body.type === "login") {    //登录
    let findUser = await db.get('SELECT name FROM users WHERE name = ?', req.body.username)
    if (!findUser) return res.json({status:201, type:req.body.type, msg:"用户名不存在"})
    else {
      let user = await db.get('SELECT * FROM users WHERE name = ?', req.body.username)
      if (user.password !== req.body.password) return res.json({status:202, type:req.body.type, msg:"密码错误"})
      res.cookie('userID', user.id, cookieConfig)
      req.session.login = true
      req.session.userID = user.id
      res.json({status:100, type:req.body.type, msg:"登陆成功"})
    }
  }

})

router.get('/logOut', (req, res, next) => {  //退出登录
  res.clearCookie('userID')
  res.redirect('/')
})


router.post('/add_post', async (req, res, next) => {     //发表文章
  console.log(req.body.content)
  if (req.user && req.user.id - 0 >= 0) {
    await db.run('INSERT INTO contents (title, content, time, userid, username) VALUES (?,?,?,?,?)', 
           req.body.title, req.body.content, new Date().toLocaleString(), req.user.id, req.user.name)
    let contentID = await db.get('SELECT id FROM contents WHERE  username=? ORDER BY id DESC LIMIT 1', req.user.name)
    res.json({status:100, msg:"发帖成功", userID: req.user.id, contentID:contentID.id})
  } else {
      req.session.login = false
      res.clearCookie('userID')
      res.json({status:201, msg:"用户身份过期"})
  }

})



router.get('/content/:contentID', async (req, res, next) => {   //获取文章详情页
  let contentData = await db.get('SELECT * FROM contents WHERE id=?', req.params.contentID)
  let commentData = await db.all('SELECT * FROM comments WHERE contentid=? ORDER BY id ASC', req.params.contentID)
  await Promise.all(commentData.map((item) => {
    return db.all('SELECT * FROM commentsComments WHERE commentid=? ORDER BY id ASC', item.id)
  }))
  .then((datas) => {
    datas.forEach((item,index) => {
      commentData[index].commentsComments = item
    })
  })

  console.log(commentData)
  if (contentData.username === req.user.name) contentData.isContentUser = true
  console.log(contentData)
  console.log(commentData)
  res.render('content',{user:req.user, contentData, commentData})
})


router.post('/add_comment', async (req, res, next) => {     //提交评论
  console.log(req.body.text)
  if (req.user && req.user.id - 0 >= 0) {
    await db.run('INSERT INTO comments (comment, contentid, userid, username, time) VALUES (?,?,?,?,?)', 
           req.body.text, req.body.contentID, req.user.id, req.user.name, new Date().toLocaleString())
    res.json({status:100, msg:"评论成功", contentID:req.body.contentID})
  } else {
      req.session.login = false
      res.clearCookie('userID')
      res.json({status:201, msg:"用户身份过期"})
  }
})


router.post('/add_commentsComments', async (req, res, next) => {     //提交评论的评论
  console.log(req.body.text)
  let time = new Date().toLocaleString()
  let isCommentuser
  if (req.user && req.user.id - 0 >= 0) {
    await db.run('INSERT INTO commentsComments (userid, username, commentid, tousername, time, text) VALUES (?,?,?,?,?,?)', 
           req.user.id, req.user.name, req.body.commentid, req.body.tousername, time, req.body.text)
    if (req.body.tousername === req.user.name) isCommentuser = true
    res.json({status:101, msg:"评论成功", text:req.body.text, time, tousername:req.body.tousername, 
              isCommentuser, username:req.user.name, commentid:req.body.commnetid})
  } else {
      req.session.login = false
      res.clearCookie('userID')
      res.json({status:201, msg:"用户身份过期"})
  }
})

router.get('/commentsComments/:contentID/:commentID', async (req, res, next) => {     //提交评论的评论
  console.log(req.body.text)
  let time = new Date().toLocaleString()
  let isCommentuser
  if (req.user && req.user.id - 0 >= 0) {
    await db.run('INSERT INTO commentsComments (userid, username, commentid, tousername, time, text) VALUES (?,?,?,?,?,?)', 
           req.user.id, req.user.name, req.body.commentid, req.body.tousername, time, req.body.text)
    if (req.body.tousername === req.user.name) isCommentuser = true
    res.json({status:101, msg:"评论成功", text:req.body.text, time, tousername:req.body.tousername, isCommentuser, username:req.user.name})
  } else {
      req.session.login = false
      res.clearCookie('userID')
      res.json({status:201, msg:"用户身份过期"})
  }
})


module.exports = router
