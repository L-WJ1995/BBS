const express = require('express')
const svgCaptcha = require('svg-captcha')
const router = express.Router()

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.login) {
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
        res.send("用户名不存在")
      }
    } else res.render("index")
  }
})

router.get('/captcha', function(req, res, next) {
  let captcha = svgCaptcha.createMathExpr({noise:3, color:true, height:33.9, width:80,})
  req.session.captcha = captcha.text.toUpperCase()
  req.session.latsCaptchaTime = Date.now()
  console.log(req.session.captcha)
  console.log(req.session.latsCaptchaTime)
  res.type('svg')
  res.json({status:200, result:captcha.data, msg:"验证码"})
})

router.post('/registerORlogin', async (req, res, next) => {
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

  if (req.body.type === "login") {
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

router.get('/logOut', (req, res, next) => {
  req.session.login = false
  res.clearCookie('userID')
  res.redirect('/')
})


router.post('/add_post', async (req, res, next) => {
  if (req.user.id - 0 >= 0) {
    await db.run('INSERT INTO contents (title, content, time, userid, username) VALUES (?,?,?,?,?)', 
           req.body.title, req.body.content, new Date().toLocaleString(), req.user.id, req.user.name)
    res.json({status:100, msg:"发帖成功"})
  } else {
      res.json({status:201, msg:"用户身份过期"})
  }

})


module.exports = router
