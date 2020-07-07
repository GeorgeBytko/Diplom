const { Router } = require('express')
const router = Router();
const News = require('../models/News');
const Lent = require('../models/Lent');
const User = require('../models/User');
const passport = require('../configpassport')
let Parser = require('rss-parser');
let parser = new Parser();
async function updatePersonNews(user) {
    try {
        const news = await News.find(
            {
                parent_lent_id: {$in: user.lents},
                pub_date: {$gt: user.dates.last_update}
            })
            .sort({pub_date: 1}).lean()
        if (news.length) {
            news.forEach(item => {
                if (!user.news_all.includes(item._id)) {
                    user.news_all.push({_id: item._id})
                    user.news_unread.push({_id: item._id})
                }

            })
        }
        user.dates.last_update = new Date().toISOString()
        await user.save()
    }
    catch (e) {
    }
}
async function addLent(title, link) {
    try {
        const lent = new Lent({
            title: title,
            link: link,
            last_update: new Date('1995-12-17T03:24:00').toISOString()
        });
        await lent.save();
        return lent
    }
    catch (e) {
    }

}
async function getUser(id) {
    return await User.findById(id, {id:0})
}
router
    .get('/', async (req, res) => {
        res.redirect('/news/all')
    })
    .get('/news/:option', async (req, res) =>{
        if (!req.isAuthenticated()) return res.render('index', { noAuth: true})//, req.session.passport.user)
        if (req.params.option) {
            try {
                let user = await getUser(req.session.passport.user)
                const lents = await Lent.find({_id: {$in: user.lents}}).lean()
                switch (req.params.option) {
                    case 'all':
                        await updatePersonNews(user)
                        let data = await News.find().sort({pub_date: -1}).limit(10).lean()
                        data.forEach(item => {
                            if (user.news_saved.includes(item._id)) {
                                item.saved = true
                            }
                            if (user.lents.includes(item.parent_lent_id)) {
                                item.lentSaved = true
                            }
                        })
                        res.render('index', {
                            data: data,
                            isAll: true,
                            unreadCount: user.news_unread.length,
                            lents: lents,
                            savedCount: user.news_saved.length,
                            allCount: user.news_all.length,
                            content_title: 'Все новости'
                        })
                        break;

                    case 'person_unread': {
                        await updatePersonNews(user)
                        const data = await News.find({_id: {$in: user.news_unread}}).sort({pub_date: -1}).lean()
                        data.forEach(item => {
                            if (user.news_saved.includes(item._id)) {
                                item.saved = true
                            }
                            item.lentSaved = true
                        })
                        res.render('index', {
                            data: data,
                            isPersonUnread: true,
                            unreadCount: user.news_unread.length,
                            lents: lents,
                            savedCount: user.news_saved.length,
                            allCount: user.news_all.length,
                            content_title: 'Ваши непрочитанные новости'
                        })
                        break
                    }
                    case 'person_all': {
                        await updatePersonNews(user)
                        const data = await News.find({_id: {$in: user.news_all}}).sort({pub_date: -1}).lean()
                        data.forEach(item => {
                            if (user.news_saved.includes(item._id)) {
                                item.saved = true
                            }
                            item.lentSaved = true
                            if (!user.news_unread.includes(item._id)) {
                                item.read = true
                            }
                        })
                        res.render('index', {
                            data: data,
                            isPersonAll: true,
                            unreadCount: user.news_unread.length,
                            lents: lents,
                            savedCount: user.news_saved.length,
                            allCount: user.news_all.length,
                            content_title: 'Все ваши новости'
                        })
                        break
                    }

                    case 'person_saved': {
                        const unsortedData = await News.find({_id: {$in: user.news_saved}}).lean()
                        let data = []
                        user.news_saved.forEach((item) => {
                            for (let i = 0; i < unsortedData.length; i++) {
                                if (item.toString() === unsortedData[i]._id.toString()) {
                                    data.unshift(unsortedData[i])
                                    break
                                }
                            }
                        })
                        data.forEach(item => {
                            if (user.news_saved.includes(item._id)) {
                                item.saved = true
                            }
                            if (user.lents.includes(item.parent_lent_id)) {
                                item.lentSaved = true
                            }
                        })
                        res.render('index', {
                            data: data,
                            isPersonSaved: true,
                            unreadCount: user.news_unread.length,
                            lents: lents,
                            savedCount: user.news_saved.length,
                            allCount: user.news_all.length,
                            content_title: 'Сохраненные новости'
                        })
                        break
                    }

                    default:
                        res.redirect('/news/all');
                }
            }
            catch (err) {
                res.sendStatus(500)
            }
          }
    })
    .post('/api/lents', async (req, res) =>{
        if (!req.isAuthenticated()) return res.sendStatus(403)
        try {
            const feed = await parser.parseURL(req.body.link)
            if (await Lent.countDocuments({title: feed.title})) {
                res.send('lent: ' + feed.title + ' already exist')
            }
            else {
                await addLent(feed.title, req.body.link)
                res.send('lent: ' + feed.title + ' added')
            }
        }
        catch (err) {
            res.send('bad link')
        }
    })
    .post('/api/users', async (req, res, next) =>{
        if(!req.body) return res.sendStatus(400);
        try {
            const newName = req.body.username;
            const newPassword = req.body.password;
            if (await User.findOne({name: newName})) return res.sendStatus(409)
            //const newLastFeedsUpdate = new Date('1995-12-17T03:24:00').toISOString();
            const newUser = new User({
                name: newName,
                password: newPassword,
                lents: [],
                dates: {
                    login_date: new Date().toISOString(),
                    last_update: new Date().toISOString()
                },
                news_all: [],
                news_saved: [],
                news_unread: []
            });
            await newUser.save()
            next()
        }
        catch (e) {
            res.sendStatus(400)
        }
    })
    .post('/api/users', async (req, res) => {
        passport.authenticate('local', (err, user) =>{
            if (err) {
                return res.sendStatus(500)
            }
            if (!user) {
                return res.sendStatus(500)
            }
            req.logIn(user, err => {
                if (err) {
                    return res.sendStatus(500)
                }
                return res.sendStatus(204)
            })
        })(req, res)
    })
    .put('/api/users/lents', async (req,res) => {
        if (!req.isAuthenticated()) return res.sendStatus(403)
        if(!req.body) return res.sendStatus(400);
        try {
            const user = await getUser(req.session.passport['user'])
            if (req.body.link) {
                const feed = await parser.parseURL(req.body.link)
                let lent = await Lent.findOne({title: feed.title})
                if (!lent) {
                    lent = await addLent(feed.title, req.body.link)
                }
                if (!user.lents.includes(lent._id)) {
                    user.lents.push(lent._id)
                    let date = new Date();
                    date.setDate(date.getDate() - 1)
                    user.dates.last_update = date.toISOString()
                    await updatePersonNews(user)
                    res.sendStatus(204)
                }
                else {
                    res.send('Лента уже существует')
                }
            }
            else {
                if (req.body._id){
                    user.lents.push(req.body._id)
                    let date = new Date();
                    date.setDate(date.getDate() - 1)
                    user.dates.last_update = date.toISOString()
                    await updatePersonNews(user)
                }
                res.sendStatus(204)
            }
        }
        catch (e) {

            res.sendStatus(400)
        }
    })
    .delete('/api/users/lents', async (req,res) => {
        if (!req.isAuthenticated()) return res.sendStatus(403)
        if(!req.body) return res.sendStatus(404);
        const lentToDelete = req.body._id;
        try {
            const user = await getUser(req.session.passport.user)
            if (!user.lents.includes(lentToDelete)) {
                res.sendStatus(404)
                return
            }
            user.lents = user.lents.filter( value => value.toString() !== lentToDelete);
            const loginDate =new Date(user.dates.login_date)
            loginDate.setDate(loginDate.getDate() - 1)
            let newsToDelete = await News.find({parent_lent_id: lentToDelete, pub_date: {$gt: loginDate.toISOString()}}, {_id: 1})
            let newsToDeleteAr = []
            newsToDelete.forEach(item => {
                newsToDeleteAr.push(item._id.toString())
            })
            user.news_all = user.news_all.filter(value => !newsToDeleteAr.includes(value.toString()))
            user.news_unread = user.news_unread.filter(value => !newsToDeleteAr.includes(value.toString()))
            await user.save();
            res.sendStatus(200)
        }
        catch (e) {
            res.sendStatus(404)
        }
    })
    .delete('/api/users/news_unread', async (req,res) => {
        if (!req.isAuthenticated()) return res.sendStatus(403)
        try {
            switch (req.body.option) {
                case 'single': {
                    let user = await getUser(req.session.passport.user)
                    user.news_unread = user.news_unread.filter(item => item.toString() !== req.body._id)
                    await user.save()
                    res.send(user)
                    break
                }
                case 'all': {
                    let user = await getUser(req.session.passport.user)
                    user.news_unread = []
                    await user.save()
                    res.send(user)
                    break
                }
                default: {
                    res.send('bad option')
                }
            }

        }
        catch (e) {
            res.sendStatus(404)
        }
    })
    .put('/api/users/news_saved', async (req,res) => {
        if (!req.isAuthenticated()) return res.sendStatus(403)
        try {
            let user = await getUser(req.session.passport.user)
            if (!user.news_saved.includes(req.body._id)) {
                user.news_saved.push(req.body._id)
                await user.save()
            }
            res.sendStatus(200)

        }
        catch (e) {
            res.sendStatus(404)
        }
    })
    .delete('/api/users/news_saved', async (req,res) => {
        if (!req.isAuthenticated()) return res.sendStatus(403)
        try {
            let user = await getUser(req.session.passport.user)
            user.news_saved = user.news_saved.filter(item =>{
                return item.toString() !== req.body._id
            })
            await user.save()
            res.sendStatus(200)
        }
        catch (e) {
            res.sendStatus(404)
        }
    })
    .post('/login', function(req, res) {
        passport.authenticate('local', (err, user) =>{

            if (err) {
                return res.sendStatus(500)
            }
            if (!user) {
                return res.status(404).send('Неверный логин/пароль')
            }
            req.logIn(user, err => {
                if (err) {
                    return res.sendStatus(500)
                }
                return res.sendStatus(204)
            })
        })(req, res)
    })
    .post('/logout', (req,res) => {
        req.logOut()
        res.sendStatus(204)
    })


module.exports = {router, passport};
