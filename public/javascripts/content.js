arrows.onclick = () => {
  shade.style.display = "block"
  setTimeout(() => shade.style["background-color"] = "rgba(0,0,0,0.5)" ,0)
  arrows.style.display = "none"
  arrows.parentNode.classList.add("trans-in")
}

shade.onclick = () => {
  shade.style.display = "block"
  setTimeout(() => shade.style["background-color"] = "transparent" ,0)
  arrows.parentNode.classList.add("trans-out")
  setTimeout(() => {
    shade.style.display = "none"
    arrows.parentNode.classList.remove("trans-in", "trans-out")
    arrows.style.display = "block"
  },1000)
}

submit_content.onclick = (e) => {
  let event = e || window.event
  if (event.preventDefault) event.preventDefault()
  else event.returnValue = false
  if(submit_text.value === "" ) {
    $(".modal-title span").text("错误！")
    $(".modal-body span").text("评论内容不能为空！")
    $(".modal-footer button").addClass("btn-warning").text("Close")
    modal_status()
  } else {
      axios({
        method:'post',
        url:'/add_comment',
        data:{
          comment: submit_text.value,
        }
      }).then((res) => {
          res_status(res.data)
      })
  }
}



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
  }, 5000)
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