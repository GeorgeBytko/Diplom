const { Router } = require('express');
const Todo = require('../models/Todo');
const Pizza = require('../models/Pizza');
const Roll = require('../models/Roll');
const Drink = require('../models/Drink');
const  Feed = require('../models/Feed');
const MainFeedList = require('../models/MainFeedList');
const User = require('../models/User');
const router = Router();

router.get('/', async (req, res) => {
  const todos = await Todo.find({});

  res.render('index', {
    title: 'Todos list',
    isIndex: true,
    allowProtoMethodsByDefault: true,
    todos
  })
});

router.get('/api/feeds', async (req, res) =>{
  const feed = await Feed.find({}).sort({pubDate: -1});
  res.send(feed)
});

router.post('/api/mainfeedlists', async (req, res) =>{
  let Parser = require('rss-parser');
  let parser = new Parser();
  await parser.parseURL(req.body.link).then( async (feed)=> {
    console.log('good');
    if (!(await MainFeedList.find({title: feed.title})).length) {
      const mainFeedList = new MainFeedList({
        title: feed.title,
        link: req.body.link,
        latestFeedDate: new Date('1995-12-17T03:24:00').toISOString()
      });
      await mainFeedList.save();
      res.sendStatus(200);
      res.end('Добавлено: ' + feed.title)
    } else {
      res.sendStatus(200);
      res.end('Лента уже существует: ' + feed.title)
    }
  }).catch(err => {
    console.log(err);
    res.sendStatus(400);
  })
});

router.post('/api/users', async (req,res) =>{
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    const newName = req.body.name;
    const newPassword = req.body.password;
    const newFeeds = [];
    const newLastFeedsUpdate = new Date('1995-12-17T03:24:00').toISOString();
    const newUser = new User({
        name: newName,
        password: newPassword,
        feeds: newFeeds,
        lastFeedsUpdate: newLastFeedsUpdate
    });
    newUser.save(function(err){
        if(err) return console.log(err);
        res.send(newUser);
    });
});

router.put('/api/users/feeds', async (req,res) => {
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    const newFeed = req.body.feed;
    const userName = req.body.name;
    const userPassword = req.body.password;
    const user = await User.findOne({name: userName, password: userPassword});
    user.feeds.push(newFeed);
    await user.save();
    res.send(user)
});

router.delete('/api/users/feeds', async (req,res) => {
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    const feedToDelete = req.body.feed;
    const userName = req.body.name;
    const userPassword = req.body.password;
    const user = await User.findOne({name: userName, password: userPassword});
    user.feeds = user.feeds.filter( (value)=>{
        return value !== feedToDelete
    });
    await user.save();
    res.send(user)
});

router.get('/api/feeds/:name', async (req,res) => {
    const userName = req.params.name;
    const user = await User.findOne({name: userName});
    if (!user) { return res.sendStatus(400)}
    let result = [];
    for (feed of user.feeds) {
        let tmp = await Feed.find({parentLink: user.feeds[0]}).limit(5).sort({pubDate: -1});
        result.push(tmp)
    }
    console.log(result[1].length);
    res.send(result)
});












router.get('/create', (req, res) => {
  res.render('create', {
    title: 'Create todo',
    isCreate: true
  })

});

router.post('/test/roll',(req,res) => {
  console.log(req.body);
  for (let key in req.body.order_) {
    console.log(key + ": " + req.body.order_[key])
  }
  res.send(req.body)
});

router.post('/create', async (req, res) => {
  const todo = new Todo({
    title: req.body.title
  });

  await todo.save();

  console.log(req.body);

  res.redirect('/')
});

router.post('/complete', async (req, res) => {
  const todo = await Todo.findById(req.body.id);

  todo.completed = !!req.body.completed;
  await todo.save();

  res.redirect('/')
});



router.get('/test/roll',async (req,res)=>{

  if (req.query.getMenu) {

    const pizzas = await Pizza.find({});
    await res.json(pizzas);
  }
  else {
    res.render('index')
  }



});
module.exports = router;
