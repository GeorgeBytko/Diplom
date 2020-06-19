$(() =>{
    /*getContentAjax('all')
    $('.sidebar__item-option').click( function() {
        console.log(this.dataset.option)
        $('.sidebar__item-option_selected').toggleClass('sidebar__item-option_selected')
        $(this).toggleClass('sidebar__item-option_selected')
        getContentAjax(this.dataset.option)
    })

    function getContentAjax(option) {
        $.ajax({
            url: '/api/news',
            type: 'GET',
            data: {
                option: option
            }
        })
            .done((data)=>{
                console.log(data)
                addContentToContainer(data)
            })
            .fail(()=>{console.log('fail')})
    }

    function addContentToContainer(data) {
        let container = document.querySelector('.news-list')
        container.innerHTML = ''
        data.forEach((item) => {
            container.insertAdjacentHTML('beforeend', `
            <div class="news-list__item" data-link="${item.link}">
                <div class="news-list__item-mark">
                </div>
                <div class="news-list__item-title">
                    ${item.title}
                </div>
                <div class="news-list__item-description">
                    ${item.desc}
                </div>
                <div class="news-list__item-author">
                    Author: ${item.author}
                </div>
                <div class="news-list__item-pub-date">
                    Date: ${item.pub_date}
                </div>
            </div>
            `)
        })
        $('.news-list__item').click( function () {
            console.log(this.dataset.link)
            window.open(this.dataset.link, '_blank')
        })
    }*/
    function saveNews(id) {
        $.ajax({
            url: '/api/users/news_saved',
            method: 'POST',
            data: {
                _id: id
            }

        })
            .then(data => console.log(data))
    }
    function deleteNews(id) {
        $.ajax({
            url: '/api/users/news_saved',
            method: 'DELETE',
            data: {
                _id: id
            }

        })
            .then(data => console.log(data))
    }
    $('.news-list__item-mark').click(function (event) {
        if (this.classList.contains('news-list__item-mark_saved')) {
            deleteNews(this.dataset._id)

        }
        else {
            saveNews(this.dataset._id)
        }

        this.classList.toggle('news-list__item-mark_saved')
        event.stopPropagation()
    })

    $('.news-list__item').click( function () {
        let saved = ''
        if (this.querySelector('.news-list__item-mark_saved')) {
            saved = 'popup-window__heading-mark_saved'
        }
        $('.popup-window').append(`
            <div class="popup-window__background"></div>
            <div class="popup-window__container">
                <div class="popup-window__heading">
                    <div class="popup-window__heading-title">
                        ${this.querySelector('.news-list__item-title').innerHTML}  
                    </div>
                    <div class="popup-window__heading-mark ${saved}"></div>
                </div>
                <div class="popup-window__info">
              <div class="popup-window__info-lent-title">
                ${this.querySelector('.news-list__item-parent-lent-title').innerHTML}
              </div>
              <div class="popup-window__info-lent-btn-follow" data-_id="id">FOLLOW</div>
          </div>
                <div class="popup-window__description">
                    ${this.querySelector('.news-list__item-description').innerHTML}
                </div>
                <div class="popup-window__additional-info-container">
              <div class="popup-window__additional-info-pub-date">${this.querySelector('.news-list__item-pub-date').innerHTML}</div>
              <div class="popup-window__additional-info-author">${this.querySelector('.news-list__item-author').innerHTML}</div>
          </div>
                <div class="popup-window__btn-container">
              <div class="popup-window__btn-source">
                  <a href="${this.dataset.link}" target="_blank"> ПЕРЕЙТИ</a>
              </div>
          </div>
      </div>
        `)
            .css('display', 'block')
            .click( function () {
                $(this).css('display','none')
                $('body').css('overflow', 'auto')
        })
        $('.popup-window__heading-mark').click((event) => {
            if (event.target.classList.contains('popup-window__heading-mark_saved')) {
                deleteNews(event.target.dataset._id)

            }
            else {
                saveNews(event.target.dataset._id)
            }

            event.target.classList.toggle('popup-window__heading-mark_saved')
            event.stopPropagation()
        })
        $('body').css('overflow', 'hidden')
        //$(this).toggleClass('test')
    })
})