let shade_status

arrows.onclick = () => {
  shade.style.display = "block"
  setTimeout(() => shade.style["background-color"] = "rgba(0,0,0,0.5)" ,0)
  arrows.style.display = "none"
  arrows.parentNode.classList.add("trans-in")
}


$('.btn_comments_Comments').click(function(){
  $('.submit_content_box').css({'z-index':'0'})
  shade.style.display = "block"
  setTimeout(() => shade.style["background-color"] = "rgba(0,0,0,0.5)" ,0)
  $(this).nextAll('.commentsComments').find('form').css({'height':'320px'})
})


shade.onclick = () => {
  if (shade_status) return
  shade_status = true
  setTimeout(() =>  shade.style["background-color"] = "transparent" ,0)
  if (arrows.style.display === "none") {
    arrows.parentNode.classList.add("trans-out")
    setTimeout(() => {
      shade.style.display = "none"
      shade_status = false 
      arrows.parentNode.classList.remove("trans-in", "trans-out")
      arrows.style.display = "block"
    },600)
  } else {
      $('.commentsComments').find('form').css({'height':'0px'})
      setTimeout(() => {
        $('.submit_content_box').css({'z-index':'100'})
        shade.style.display = "none"
        shade_status = false
      },600)
  }
}


$('.submit_content').click(function(e){
  let els = $(this).parents('.comments').children('span')
  let text = $(this).parents('form.form-horizontal').find('.submit_text')[0]
  let event = e || window.event
  if (event.preventDefault) event.preventDefault()
  else event.returnValue = false
    if(text.value === "" ) {
    $(".modal-title span").text("错误！")
    $(".modal-body span").text("评论内容不能为空！")
    $(".modal-footer button").addClass("btn-warning").text("Close")
    modal_status()
  } else {
      axios({
        method:'post',
        url:$(this).parents('form.form-horizontal')[0].action,
        data:{
          text: text.value,
          tousername:els[2] ? els[2].textContent : undefined,
          contentID:window.location.href.split("/").pop(),
          commentid:els[0] ? els[0].textContent : undefined,
        }
      }).then((res) => {
          res_status(res.data)
      })
  }
})







function res_status(data) {
  console.log(data)
  switch(data.status) {
    case 100: {
      $(".modal-title span").text("评论成功")
      $(".modal-body span").text("正在刷新")
      $(".modal-footer button").removeClass("btn-warning").addClass("btn-success").text("刷新中...")
      $(".bs-example-modal-sm").modal("show")
      setTimeout(() => window.location.href = "./" + data.contentID, 100)
      break
    }

    case 101: {
      $(".modal-title span").text("评论成功")
      $(".modal-body span").text("即将关闭提示！")
      $(".modal-footer button").removeClass("btn-warning").addClass("btn-success").text("Close")
      $(".bs-example-modal-sm").modal("show")
      createComment_s(data.commentid)
      break
    }

    case 201: {
      $(".modal-title span").text("评论失败")
      $(".modal-body span").text("用户身份过期,请重新登录！")
      $(".modal-footer button").addClass("btn-warning").text("Close")
      setTimeout(() => window.location.href = "./", 3000)
      break
    }

  }
  modal_status()
}


function modal_status() {
  $(".bs-example-modal-sm").modal("show")
  let modal_ID = setTimeout(() => {
    $(".bs-example-modal-sm").modal("hide")
  }, 3000)
  $(".bs-example-modal-sm").on("hidden.bs.modal", () => {
    clearTimeout(modal_ID)
    $(".bs-example-modal-sm").off("hidden.bs.modal")
  })
}

$("textarea").on('keydown',function(e) {
  if (e.keyCode == 9) {
    e.preventDefault()
    let indent = '    '
    let start = this.selectionStart
    let end = this.selectionEnd
    let selected = window.getSelection().toString();
    selected = indent + selected.replace(/\n/g, '\n' + indent)
    this.value = this.value.substring(0, start) + selected + this.value.substring(end)
    this.setSelectionRange(start + indent.length, start+ selected.length)
  }
})

function createComment_s(commentid) {
  axios({
    method:'get',
    url:`/commentsComments/${window.location.href.split("/").pop()}/${commentid}`,
    data:{
      text: text.value,
      tousername:els[2] ? els[2].value : undefined,
      commentid:els[0] ? els[0].value : undefined,
    }
  }).then((res) => {
      res_status(res.data)
  })
}