$(() =>{

    function saveNews(id) {
        $.ajax({
            url: '/api/users/news_saved',
            method: 'PUT',
            data: {
                _id: id
            }

        })

    }
    function deleteNews(id) {
        $.ajax({
            url: '/api/users/news_saved',
            method: 'DELETE',
            data: {
                _id: id
            }

        })
            .then(data => { })
            .catch(data => {
            })
    }
    function deleteLent(id, reload) {
        $.ajax({
            url:'/api/users/lents',
            method: 'DELETE',
            data: {
                _id: id
            }
        })
            .then(()=>{
                if (reload) {
                    location.reload()
                }
            })
            .catch((e) => {
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
    function addLentByUrl(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/api/users/lents',
                method: 'PUT',
                data: {
                    link: url
                }
            })
                .done(data => resolve(data))
                .fail(e => reject(e))
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


    $('.sidebar__item-list-item-unfollow-btn').click( function (event) {
        deleteLent(event.target.dataset._id, true)
    })

    $('.news-list__item').on('click', function (ev) {
        if (ev.target.classList.contains('news-list__item-mark')) {
            if (ev.target.classList.contains('news-list__item-mark_saved')) {
                deleteNews(ev.target.dataset._id)
            }
            else {
                saveNews(ev.target.dataset._id)
            }
            ev.target.classList.toggle('news-list__item-mark_saved')
            return
        }
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
        const $popupWindow = $('<div class="popup-window"></div>');
        $popupWindow
            .append(`
            <div class="popup-window__background"></div>
            
            <div class="popup-window__container">
            <div class="popup-window__container-btn-close">CLOSE</div>
                <div class="popup-window__heading">
                    <div class="popup-window__heading-title">
                        ${this.querySelector('.news-list__item-title').textContent}  
                    </div>
                    <div class="popup-window__heading-mark ${markSavedClass}" data-_id="${this.dataset._id}"></div>
                </div>
                <div class="popup-window__info">
              <div class="popup-window__info-lent-title">
                ${this.querySelector('.news-list__item-parent-lent-title').textContent}
              </div>
              <div class="popup-window__info-lent-btn-follow ${followBtnFollowedClass}" data-_id="${this.dataset.parent_id}">${markSavedText}</div>
          </div>
                <div class="popup-window__description">
                    ${this.querySelector('.news-list__item-description').textContent}
                </div>
                <div class="popup-window__additional-info-container">
              <div class="popup-window__additional-info-pub-date">${this.querySelector('.news-list__item-pub-date').textContent}</div>
              <div class="popup-window__additional-info-author">${this.querySelector('.news-list__item-author').textContent}</div>
          </div>
                <div class="popup-window__btn-container">
              <div class="popup-window__btn-source">
                  <a href="${this.dataset.link}" target="_blank"> ПЕРЕЙТИ</a>
              </div>
          </div>
      </div>
        `)
            .css('display', 'block')
            .on('click',(event) => {
                if (event.target.classList.contains('popup-window__info-lent-btn-follow')) {
                    if (event.target.classList.contains('popup-window__info-lent-btn-follow_followed')) {
                        event.target.textContent = 'FOLLOW'
                        deleteLent(event.target.dataset._id)
                    }
                    else {
                        event.target.textContent = 'UNFOLLOW'
                        addLent(event.target.dataset._id)
                    }
                    event.target.classList.toggle('popup-window__info-lent-btn-follow_followed')
                    event.stopPropagation()
                    followBtnClicked = true
                    return
                }

                if (event.target.classList.contains('popup-window__heading-mark')) {
                    if (event.target.classList.contains('popup-window__heading-mark_saved')) {
                        deleteNews(event.target.dataset._id)
                    }
                    else {
                        saveNews(event.target.dataset._id)
                    }
                    listItemMark.classList.toggle('news-list__item-mark_saved')
                    event.target.classList.toggle('popup-window__heading-mark_saved')
                    event.stopPropagation()
                    return
                }

                if (event.target.classList.contains('popup-window__background')) {
                    $popupWindow.remove()
                    $('body').css('overflow', 'auto')
                    if (followBtnClicked) {
                        document.location.reload();
                    }

                }
            })

        $('body').css('overflow', 'hidden').append($popupWindow)

    })

    $('.sidebar__item-list-btn-add').click( function () {
        const $popupWindow = $('<div class="popup-window"></div>')
        $popupWindow
            .append(`
                <div class="popup-window__background"></div>
                <div class="popup-window__add-lent-container" data-text="">
                    <form class="add-lent-form">
                        <div class="add-lent-form__rss-url-input-container">
                            <label for="url">Ссылка на источник ленты</label>
                            <input type="url" name="url" placeholder="url">
                        </div>
                        <div class="add-lent-form__btn-container">
                            <button type="submit" class="add-lent-form__btn-add">Добавить</button>
                            <button type="button" class="add-lent-form__btn-close">Закрыть</button>
                        </div>
                    </form>
                </div>
            `)
            .css('display','block')
            .on('click', (event) => {
                const cl = event.target.classList
                if (cl.contains('popup-window__background') || cl.contains('add-lent-form__btn-close')) {
                    $popupWindow.remove()
                    $('body').css('overflow', 'auto')
                }
            })
            .on('submit', (event) => {
                event.preventDefault()
                const urlInput = event.target.elements.url
                $(urlInput).on('focus', e => {
                    e.target.parentNode.classList.remove('add-lent-form__rss-url-input-container__error')
                })
                if (urlInput.value) {
                    addLentByUrl(urlInput.value)
                        .then((data) => {
                            if (data) {
                                urlInput.parentNode.classList.add('add-lent-form__rss-url-input-container__error')
                                urlInput.parentNode.dataset.text = data
                            }
                            else {
                                document.location.reload()
                            }
                        })
                        .catch(e => {
                            urlInput.parentNode.classList.add('add-lent-form__rss-url-input-container__error')
                            urlInput.parentNode.dataset.text = 'Плохая ссылка'
                        })
                }
                else {
                    urlInput.parentNode.classList.add('add-lent-form__rss-url-input-container__error')
                    urlInput.parentNode.dataset.text = 'Введите ссылку'
                }

            })
        $('body').css('overflow','hidden').append($popupWindow)
    })

    $('.sidebar__item-log').on('click', (event) => {
        const $popupWindow = $('<div class="popup-window"></div>')
        let $content;
        switch (event.target.dataset.log) {

            case 'in':{
                $content = $(`
                    <div class="popup-window__background"></div>
                    <div class="popup-window__log-form-container">
                        <form class="popup-window__log-form">
                            <div class="popup-window__log-form-radio-container">
                                <div class="popup-window__log-form-radio">
                                    <label for="radio-login">Войти</label>
                                    <input type="radio" name="log_radio" value="login" id="radio-login" checked>
                                </div>
                                <div class="popup-window__log-form-radio">
                                    <label for="radio-reg">Зарегестрироваться</label>
                                    <input type="radio" name="log_radio" value="reg" id="radio-reg">
                                </div>
                            </div>
                            <div class="popup-window__log-form-input-container" data-err="">
                                <label for="name">Логин</label>
                                <input type="text" name="name">
                                <label for="password">Пароль</label>
                                <input type="password" name="password">
                            </div>
                            <div class="popup-window__log-btn-container"> 
                                <button class="popup-window__log-btn-submit" type="submit">Подтвердить</button> 
                                <button class="popup-window__log-btn-close" data-action="close" type="button">Отмена</button>
                            </div>
                        </form>
                    </div>
                `)
                break
            }
            case 'out': {
                $content = $(`
                    <div class="popup-window__background"></div>
                    <div class="popup-window__log-form-container">
                        <form class="popup-window__log-form">
                            <input type="radio" name="log_radio" value="logout" id="radio-login" checked hidden>
                            <div class="popup-window__log-content">Вы уверены что хотите выйти?</div>
                            <div class="popup-window__log-btn-container"> 
                                <button class="popup-window__log-btn-submit" type="submit">Выйти</button>
                                <button class="popup-window__log-btn-close" type="button">Отмена</button>
                            </div>
                        </form>
                    </div>
                `)
                break
            }

        }
        $popupWindow.append($content)
            .css('display','block')
            .on('submit', ev => {
                ev.preventDefault()
                const target = ev.target;
                switch(target.elements.log_radio.value) {
                    case 'login': {
                        $.ajax({
                            method: 'POST',
                            url: '/login',
                            data: {
                                username: target.elements.name.value,
                                password: target.elements.password.value
                            }
                        })
                            .done(() => {
                                document.location.reload()
                            })
                            .fail(e => {
                                document.querySelector('.popup-window__log-form-input-container').dataset.err = 'Неверный логин или пароль'
                                document.querySelector('.popup-window__log-form-input-container').classList.add('popup-window__log-form-input-container_error')
                            })
                        break
                    }
                    case 'reg': {
                        $.ajax({
                            method: "POST",
                            url: '/api/users',
                            data: {
                                username: target.elements.name.value,
                                password: target.elements.password.value
                            }
                        })
                            .done(() => {
                                document.location.reload()
                            })
                            .fail((e) => {
                                switch (e.status) {
                                    case 409:
                                        document.querySelector('.popup-window__log-form-input-container').dataset.err = 'Данный логин уже занят'
                                        break
                                    default:
                                        document.querySelector('.popup-window__log-form-input-container').dataset.err = 'Ошибка сервера'
                                }

                                document.querySelector('.popup-window__log-form-input-container').classList.add('popup-window__log-form-input-container_error')
                            })
                        break
                    }
                    default : {
                        $.ajax({
                            method: 'POST',
                            url: '/logout'
                        })
                            .done(() => {
                                document.location.reload()
                            })
                    }
                }
            })
            .on('click', ev => {
                if (ev.target.classList.contains('popup-window__log-btn-close') || ev.target.classList.contains('popup-window__log-form-container')) {
                    $popupWindow.remove()
                    return
                }
                if (ev.target.tagName === 'INPUT') {
                    document.querySelector('.popup-window__log-form-input-container').classList.remove('popup-window__log-form-input-container_error')
                }
            })
        $('body').css('overflow','hidden').append($popupWindow)
    })
})