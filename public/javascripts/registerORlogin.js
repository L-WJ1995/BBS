document.addEventListener('DOMContentLoaded', () => captcha_img.click())

let userLogin = $("[name='SignIn']")[0]
let userRegister = $("[name='SignUp']")[0];
[userLogin, userRegister].forEach((item, index) => {
    item.onclick = (e) => {
      let event = e || window.event
      if (event.preventDefault) event.preventDefault()
      else event.returnValue = false
      if (index === 0) login()
      else register()
   }
})

function login() {

  if (!input_judge()) return

  axios({
    method:'post',
    url:'/registerORlogin',
    data:{
      username:username.value + "",
      password:password.value + "",
      captcha:captcha.value.toUpperCase() + "",
      keepLogin:keepLogin.checked,
      type:"login",
    }
  }).then((res) => {
      res_status(res.data)
  })
}

function register() {

  if (!input_judge()) return

  axios({
    method:'post',
    url:'/registerORlogin',
    data:{
      username:username.value + "",
      password:password.value + "",
      captcha:captcha.value.toUpperCase() + "",
      avatarPath:"", //暂时未添加头像功能
      keepLogin:keepLogin.checked,
      type:"register",
    }
  }).then((res) => {
      res_status(res.data)
  })
}

function input_judge() {
  if (username.value === "") {
    captcha.value = ""
    $(".modal-title span").text("错误")
    $(".modal-body span").text("用户名不能为空！")
    $(".modal-footer button").addClass("btn-warning").text("Close")
    modal_status()
    return false 
  } else if (password.value === "") {
    captcha.value = ""
    $(".modal-title span").text("错误")
    $(".modal-body span").text("密码不能为空！")
    $(".modal-footer button").addClass("btn-warning").text("Close")
    modal_status()
    return false
  } else if (captcha.value === "") {
    captcha.value = ""
    $(".modal-title span").text("错误")
    $(".modal-body span").text("验证码不能为空！")
    $(".modal-footer button").addClass("btn-warning").text("Close")
    modal_status()
    return false
  } else return true
}


captcha_img.onclick = () => {
  axios('/captcha').then((res) => $("#captcha_img").empty().append(res.data.result))
}


function modal_status() {
  $(".bs-example-modal-sm").modal("show")
  let modal_ID = setTimeout(() => {
    $(".bs-example-modal-sm").modal("hide")
  }, 5000)
  $(".bs-example-modal-sm").on("hidden.bs.modal", () => {
    clearTimeout(modal_ID)
    $(".bs-example-modal-sm").off("hidden.bs.modal")
  })
}

function res_status(data) {
  console.log(data)
  switch(data.status) {
    case 100: {
      let str = [data.type === "login" ? "登录成功" : "注册成功", "欢迎访问BBS！"]
      $(".modal-title span").text(str[0])
      $(".modal-body span").text(str[1])
      $(".modal-footer button").removeClass("btn-warning").addClass("btn-success").text("登录中...")
      $(".bs-example-modal-sm").modal("show")
      setTimeout(() => window.location.href = "./", 1000)
      break
    }

    case 201: {
      username.value = captcha.value = ""
      let str = data.type === "login" ? ["登录失败", "用户名不存在,请重试！"] : ["注册失败", "用户名已存在,请更换用户名！"]
      $(".modal-title span").text(str[0])
      $(".modal-body span").text(str[1])
      $(".modal-footer button").addClass("btn-warning").text("Close")
      break
    }

    case 202: {
      username.value = password.value = captcha.value = ""
      $(".modal-title span").text("登录失败")
      $(".modal-body span").text("用户名或密码错误,请重试！")
      $(".modal-footer button").addClass("btn-warning").text("Close")
      break
    }

    case 203: {
      captcha.value = ""
      let str = data.type === "login" ? ["登录失败", "验证码输入有误,请重试！"] : ["注册失败", "验证码输入有误,请重试！"]
      $(".modal-title span").text(str[0])
      $(".modal-body span").text(str[1])
      $(".modal-footer button").addClass("btn-warning").text("Close")
      break
    }

    case 205: {
      captcha.value = ""
      let str = data.type === "login" ? ["登录失败", "验证码超时,请重试！"] : ["注册失败", "验证码超时,请重试！"]
      $(".modal-title span").text(str[0])
      $(".modal-body span").text(str[1])
      $(".modal-footer button").addClass("btn-warning").text("Close")
      break
    }
  }

  if (data.status !== 100) {
    captcha_img.click()
    modal_status()
  }
}


document.onkeydown = (e) => {
  if (e.keyCode !== 13) return
  let event = e || window.event
  event.preventDefault()
  window.event.returnValue = false
  userLogin.click()
}