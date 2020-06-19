const { Router } = require('express')
const router = Router();
const Todo = require('../models/Todo');
const Roll = require('../models/Roll')
const News = require('../models/News');
const Lent = require('../models/Lent');
const User = require('../models/User');
let Parser = require('rss-parser');
let parser = new Parser();
router.get('/get-cookie', (req, res) => {
    console.log('Cookie: ', req.cookies)
    res.send('Get Cookie')
})

router.get('/set-cookie', (req, res) => {
    res.cookie('token', '12345ABCDE')
    res.send('Set Cookie')
})
router.get('/', async (req, res) => {
    News.find({}, (err, data) => {
      res.render('index', {
          title: 'Todos list',
          isIndex: true,
      })
    }).limit(10).lean();

});

router.get('/datachange', async (req,res) =>{
    res.render('datachange', {
        isDataChange: true
    })
})

router.get('/news/:option', async (req, res) =>{
    console.log(req.params)
  if (req.params.option) {
      let user = await getUser()
      switch (req.params.option) {
          case 'all':
              console.log('all')
              let data = await News.find().sort({pub_date: -1}).limit(10).lean()
              data.forEach(item => {
                  if (user.news_saved.includes(item._id)) {
                      item.saved = true
                  }
              })
              res.render('index', {
                  data:data,
                  isAll : true,
                  unreadCount: user.news_unread.length
              })
              break;

          case 'person_unread': {

              console.log('person_new')

              await updatePersonNews(user)
              const data = await News.find({_id: {$in: user.news_unread}}).sort({pub_date: 1}).lean()
              data.forEach(item => {
                  if (user.news_saved.includes(item._id)) {
                      item.saved = true
                  }
              })
              res.render('index', {
                  data:data,
                  isPersonUnread: true,
                  unreadCount: user.news_unread.length
              })
              break
          }
          case 'person_all': {

              console.log('person_all')

              await updatePersonNews(user)
              const data = await News.find({_id: {$in: user.news_all}}).sort({pub_date: 1}).lean()
              data.forEach(item => {
                  if (user.news_saved.includes(item._id)) {
                      item.saved = true
                  }
              })
              res.render('index', {
                  data:data,
                  isPersonAll: true,
                  unreadCount: user.news_unread.length
              })
              break
          }

          case 'person_saved': {

              console.log('person_saved')

              const data = await News.find({_id: {$in: user.news_saved}}).sort({pub_date: 1}).lean()
              data.forEach(item => {
                  if (user.news_saved.includes(item._id)) {
                      item.saved = true
                  }
              })
              res.render('index', {
                  data:data,
                  isPersonSaved: true,
                  unreadCount: user.news_unread.length
              })
              break
          }


          default:
              console.log('unknown')
              res.redirect('/news/all')
      }
  } else {
      res.status(500)
  }
});

async function updatePersonNews(user) {
    const news = await News.find(
        {
            parent_lent_id: {$in: user.lents},
            pub_date: {$gt: user.dates.last_update}
        })
        .sort({pub_date: 1}).lean()
    if (news.length) {
        news.forEach(item => {
            if (!user.news_all.includes(item._id)){
                user.news_all.push({_id: item._id})
                user.news_unread.push({_id: item._id})
            }

        })
    }
    user.dates.last_update = new Date().toISOString()
    await User.updateOne(user)
}


router.post('/api/lents', async (req, res) =>{
    await parser.parseURL(req.body.link).then( async (feed)=> {

        console.log(feed.title)
        if (await Lent.countDocuments({title: feed.title})) {
            res.send('lent: ' + feed.title + ' already exist')
        }
        else {
            await addLent(feed.title, req.body.link)
            res.send('lent: ' + feed.title + ' added')
        }

    }).catch(err => {
        console.log(err);
        res.send('bad link')
    })

});

async function addLent(title, link) {
    const lent = new Lent({
        title: title,
        link: link,
        last_update: new Date('1995-12-17T03:24:00').toISOString()
    });
    await lent.save();
    return lent
}
router.get('/api/testt', async (req,res) => {
    const user = await User.findOne({name: 'admin'})
    user.dates.last_update = await new Date().toISOString()
    await User.updateOne(user)
    res.send(user)
})
router.post('/api/users', async (req,res) =>{
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    const newName = req.body.name;
    const newPassword = req.body.password;
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
    newUser.save(function(err){
        if(err) return console.log(err);

        res.send(newUser);
    });
});

router.put('/api/users/lents', async (req,res) => {

    if(!req.body) return res.sendStatus(400);
    console.log(req.body);

    const user = await getUser()
    await parser.parseURL(req.body.link).then( async (feed)=> {

        let lent = await Lent.findOne({title: feed.title})
        if (!lent) {
            lent = await addLent(feed.title, req.body.link)
        }
        if (!user.lents.includes(lent._id)) {
            user.lents.push(lent._id)
            let date = new Date();
            date.setDate(date.getDate() - 1)
            user.dates.last_update = date.toISOString()
            await User.updateOne(user)
            await updatePersonNews(user)
        }
        res.send(user)

    }).catch(err => {
        console.log(err);
        res.send('bad link')
    })

});

router.delete('/api/users/lents', async (req,res) => {
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    const lentToDelete = req.body._id;
    const user = await getUser()
    user.feeds = user.feeds.filter( value => value !== lentToDelete);
    await User.updateOne(user);
    res.send(user)
});

async function getUser() {
    return await User.findOne({name: 'admin'})
}

router.delete('/api/users/news_unread', async (req,res) => {
    switch (req.body.option) {
        case 'single': {
            let user = await getUser()
            user.news_unread = user.news_unread.filter(item => item !== req.body._id)
            await User.updateOne(user)
            res.send(user)
            break
        }
        case 'all': {
            let user = await getUser()
            user.news_unread = []
            await User.updateOne(user)
            res.send(user)
            break
        }
        default: {
            res.send('bad option')
        }
    }
})

router.post('/api/users/news_saved', async (req,res) => {
    let user = await getUser()
    if (!user.news_saved.includes(req.body._id)) {
        user.news_saved.push(req.body._id)
        await User.updateOne(user)
    }
    res.send(user)
})

router.delete('/api/users/news_saved', async (req,res) => {
    let user = await getUser()
    console.log(req.body._id)
    user.news_saved = user.news_saved.filter(item =>{
        return item != req.body._id
    })
    console.log(user.news_saved)
    await User.updateOne(user)
    res.send(user)
})

router.get('/api/feeds/:name', async (req,res) => {
    const userName = req.params.name;

    let result = await News.find().limit(5).sort({pubDate: -1});
    console.log(userName);
    res.send(result)
});

module.exports = router;
