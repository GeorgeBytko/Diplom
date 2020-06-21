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
            .then(data => {console.log(data) })
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

    $('.sidebar__item-list-item-unfollow-btn').click( function (event) {
        console.log(event.target.dataset._id)
        deleteLent(event.target.dataset._id, true)


    })

    function deleteLent(id, reload) {
        $.ajax({
            url:'/api/users/lents',
            method: 'DELETE',
            data: {
                _id: id
            }
        }).then(()=>{
            if (reload) {
                location.reload()
            }
        })
    }

    function addLent(id) {
        $.ajax({
            url: '/api/users/lents',
            method: 'PUT',
            data: {
                _id: id
            }
        })
    }
    function deleteUnreadNews(id) {
        $.ajax({
            method: 'DELETE',
            url: '/api/users/news_unread',
            data: {
                _id : id,
                option: 'single'
            }
        })
    }

    $('.news-list__item').click( function (e) {
        const listItemMark = this.querySelector('.news-list__item-mark')
        let followBtnFollowedClass = ''
        let markSavedText = 'FOLLOW'
        let followBtnClicked = false
        if (Boolean(this.dataset.parent_saved)) {
            followBtnFollowedClass = 'popup-window__info-lent-btn-follow_followed'
            markSavedText = 'UNFOLLOW'
        }
        let markSavedClass = ''

        if (this.querySelector('.news-list__item-mark_saved')) {
            markSavedClass = 'popup-window__heading-mark_saved'
        }
        if (!this.classList.contains('news-list__item_read')) {
            this.classList.add('news-list__item_read')
            deleteUnreadNews(this.dataset._id)
        }

        $('.popup-window').empty().append(`
            <div class="popup-window__background"></div>
            
            <div class="popup-window__container">
            <div class="popup-window__container-btn-close">CLOSE</div>
                <div class="popup-window__heading">
                    <div class="popup-window__heading-title">
                        ${this.querySelector('.news-list__item-title').innerHTML}  
                    </div>
                    <div class="popup-window__heading-mark ${markSavedClass}" data-_id="${this.dataset._id}"></div>
                </div>
                <div class="popup-window__info">
              <div class="popup-window__info-lent-title">
                ${this.querySelector('.news-list__item-parent-lent-title').innerHTML}
              </div>
              <div class="popup-window__info-lent-btn-follow ${followBtnFollowedClass}" data-_id="${this.dataset.parent_id}">${markSavedText}</div>
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
        $('.popup-window__background').click( function () {
            $('.popup-window').css('display','none')
            $('body').css('overflow', 'auto')
            if (followBtnClicked) {
                document.location.reload();
            }
        })
        $('.popup-window__heading-mark').click((event) => {
            if (event.target.classList.contains('popup-window__heading-mark_saved')) {
                deleteNews(event.target.dataset._id)

            }
            else {
                saveNews(event.target.dataset._id)
            }
            listItemMark.classList.toggle('news-list__item-mark_saved')
            event.target.classList.toggle('popup-window__heading-mark_saved')
            event.stopPropagation()
        })
        $('.popup-window__info-lent-btn-follow').click((event) => {
            if (event.target.classList.contains('popup-window__info-lent-btn-follow_followed')) {
                event.target.innerHTML = 'FOLLOW'
                deleteLent(event.target.dataset._id)
            }
            else {
                event.target.innerHTML = 'UNFOLLOW'
                addLent(event.target.dataset._id)
            }
            event.target.classList.toggle('popup-window__info-lent-btn-follow_followed')
            event.stopPropagation()
            followBtnClicked = true

            //

        })
        $('body').css('overflow', 'hidden')

    })
})