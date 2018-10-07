let shade_status
let submit_content_box_status
let contentID = window.location.href.split("/").pop()
let comment_comment_box

arrows.onclick = () => {
  shade.style.display = "block"
  setTimeout(() => shade.style["background-color"] = "rgba(0,0,0,0.5)" ,0)
  arrows.style.display = "none"
  arrows.parentNode.classList.add("trans-in")
}


$('.btn_comments_Comments').click(function(){
  $('.submit_content_box').css({'z-index':'0'})
  shade.style.display = "block"
  submit_content_box_status = true
  setTimeout(() => shade.style["background-color"] = "rgba(0,0,0,0.5)" ,0)
  $(this).nextAll('.commentsComments').find('form').css({'height':'320px'})
})



$('.switch button').click(function(){
  shade.style.display = "block"
  $('.submit_content_box').css({'z-index':'0'})
  setTimeout(() => shade.style["background-color"] = "rgba(0,0,0,0.5)" ,0)
  let commentID = $(this).parents('.comment_box').find('span')[1].textContent
  let el = $(this).parents('.comment_box').find('.comment_comment_box > ul:first-child')
  shade.style.display = "block"
  axios({
    method:'get',
    url: '/commentsComments/' + commentID ,
  }).then((res) => {
      res_status(res.data, el)
  })
})


shade.onclick = () => {
  if (shade_status) return
  shade_status = true
  setTimeout(() =>  shade.style["background-color"] = "transparent" ,0)
  if (arrows.style.display === "none") {
    arrows.parentNode.classList.add("trans-out")
    setTimeout(() => {
      arrows.parentNode.classList.remove("trans-in", "trans-out")
      arrows.style.display = "block"
    },600)
  } else if (submit_content_box_status){
      $('.commentsComments').find('form').css({'height':'0px'})
      setTimeout(() => {
        $('.submit_content_box').css({'z-index':'100'})
        submit_content_box_status = false
      },600)
  } else {
      comment_comment_box.removeClass('comment_comment_box_in')
      setTimeout(() => {
        comment_comment_box.css('display','none')
        comment_comment_box.find('ul:nth-child(1) li').not('.clone').remove()
        
        comment_comment_box.find('.lookTalk_container_in li').not('.clone_lookTalk').remove()
        comment_comment_box.find('.lookTalk_container_in').removeClass('lookTalk_container_in')
        comment_comment_box.find('.return_in').css('display',"none")
        comment_comment_box.find('.return_in').removeClass('return_in')

        $('.submit_content_box').css({'z-index':'100'})
        submit_content_box_status = false
      },600)
  }
  setTimeout(() => {
    shade.style.display = "none"
    shade_status = false
  },600)
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
          contentID:contentID,
          commentid:els[0] ? els[0].textContent - 0 : undefined,
        }
      }).then((res) => {
          res_status(res.data, $(this).parents('.comment_box'))
      })
  }
})







function res_status(data, el) {
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
      shade.click()
      el.find('.submit_text')[0].value = ''
      el1 = el.find('.switch')[0]
      el2 = el.find('.sumComments')[0]
      $(".modal-title span").text("评论成功")
      $(".modal-body span").text("即将关闭提示！")
      $(".modal-footer button").removeClass("btn-warning").addClass("btn-success").text("Close")
      $(".bs-example-modal-sm").modal("show")
      modal_status()
      el2.textContent = el2.textContent - 0 + 1
      if (el1.style && el1.style.display === "none") el1.style.display = "block"
      break
    }

    case 102: {
      comment_comment_box = el.parent()
      createComment_s(data, el)
      break
    }

    case 108: {
      $(".modal-title span").text("评论成功")
      $(".modal-body span").text("即将关闭提示！")
      $(".modal-footer button").removeClass("btn-warning").addClass("btn-success").text("Close")
      $(".bs-example-modal-sm").modal("show")
      modal_status()
      data.srcoll = true
      comment_comment_box = el
      createComment_s(data, el.find('ul:nth-child(1)'))
      break
    }

    case 109: {
      createLookTales(data.data, el.parents('.comment_comment_box').find('ul:nth-child(2)'))
      break
    }



  }
  
}


function modal_status() {
  $(".bs-example-modal-sm").modal("show")
  let modal_ID = setTimeout(() => {
    $(".bs-example-modal-sm").modal("hide")
  }, 1500)
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

function createComment_s(data, el) {
  if(!Array.isArray(data.commentCommentsData)) data.commentCommentsData = [data.commentCommentsData] 
  data.commentCommentsData.forEach((item) => {
    if (item.tousername) $('.clone').find('div.reply_tip .lookTalk').css('display','block')
    else $('.clone').find('div.reply_tip .lookTalk').css('display','none')
    let spans = el.find('.clone').find('span')
    spans[0].textContent = item.tousername ? `${item.username} 评论 ${item.tousername} :` : `${item.username} 评论 :`
    spans[1].textContent = item.text
    spans[2].textContent = item.time
    spans[3].textContent = JSON.stringify([item.userid,item.username,item.tousername,item.commentid,item.commentsCommentsId])
    if (item.username === data.user) $('.clone').find('button.temp').text("删除").removeClass('btn-primary').addClass('btn-danger')
    else $('.clone').find('button.temp').text("评论").removeClass('btn-danger').addClass('btn-primary')
    el.find('.clone').clone().removeClass('clone').css('display','block').appendTo(el)
  })
  if(data.srcoll)  el.scrollTop(el.prop('scrollHeight'))
  comment_comment_box.css('display','block')
  setTimeout(() => {
    comment_comment_box.addClass('comment_comment_box_in')
    el.addClass('move_in')
  }, 0)
}


function createLookTales(data, el) {
  data.forEach((item) => {
    let spans = el.find('.clone_lookTalk').find('span')
    spans[0].textContent = item.tousername ? `${item.username} 评论 ${item.tousername} :` : `${item.username} 评论 :`
    spans[1].textContent = item.text
    spans[2].textContent = item.time
    el.find('.clone_lookTalk').clone().removeClass('clone_lookTalk').css('display','block').appendTo(el)
  })
  setTimeout(() => {
    el.parent().find('ul:first-child').removeClass('move_in')
    el.addClass('lookTalk_container_in')
    el.parent().find('.return').css('display',"block")
  }, 0)
  setTimeout(() => el.parent().find('.return').addClass('return_in'), 600)
}



$('.comment_comment_box').delegate('button.temp','click',function(){
  $(this).parent().css('display','none')
  $(this).parent().next('.reply_text').css('display','block')
})

$('.comment_comment_box').delegate('.reply_text button:nth-child(3)','click',function(){
  $(this).parent().css('display','none')
  $(this).parent().prev('.reply_tip').css('display','flow-root')
})

$('.comment_comment_box').delegate('.reply_text input','input',function(){
  if ($(this).val().trim().length > 0) $(this).next().removeClass('notClick').addClass('btn-success').removeAttr('disabled')
  else $(this).next().removeClass('btn-success').addClass('notClick').attr('disabled')
})


$('.comment_comment_box').delegate('.reply_text button:nth-child(2)','click',function(){
  let text = $(this).prev().val()
  let touser = JSON.parse($(this).next().next().text())
  let commentid = $(this).parents('.comments').find('span:nth-child(1)')[0].textContent
  axios({
    method:'post',
    url:'/replyComment',
    data:{
      text,
      commentsCommentsId:touser[0],
      tousername:touser[1] ,
      commentid:commentid,
      contentID,
    }
  }).then((res) => {
      if (res.data.status === 108) $(this).next().click()
      res_status(res.data, $(this).parents('.comment_comment_box'))
  })
})


$('.comment_comment_box').delegate('.reply_tip .lookTalk','click',function(){
  let data = JSON.parse($(this).parent().next().find('span').text())
  let commentid = $(this).parents('.comments').find('span:nth-child(1)')[0].textContent
  axios({
    method:'get',
    url:`/usersTalk/${contentID}/${data[3]}/${data[0]}/${data[2]}`,
  }).then((res) => {
      res_status(res.data, $(this))
  })
})

function btn_return(el){
  $(el).prev().removeClass('lookTalk_container_in')
  $(el).removeClass('return_in')
  $(el).parent().find('ul:first-child').addClass('move_in')
  setTimeout(() => {
     $(el).prev().find('li').not('.clone_lookTalk').remove()
     $(el).css('display',"none")
  },600)
}


function update(data){

}

