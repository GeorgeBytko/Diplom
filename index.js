const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const request = require('request')
const exphbs = require('express-handlebars')
const todoRoutes = require('./routes/todos')
let Parser = require('rss-parser');
let parser = new Parser();
const RssFeedEmitter = require('rss-feed-emitter');
const feeder = new RssFeedEmitter();
const PORT = process.env.PORT || 3000

const app = express()
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',

})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(todoRoutes)

async function start() {
  try {
    await mongoose.connect(
      'mongodb+srv://george:qwertyfuck15@cluster0-bi0ip.mongodb.net/todos',
      {
        useNewUrlParser: true,
        useFindAndModify: false
      }
    )
    app.listen(PORT, () => {
      console.log('Server has been started...')
    })
    /*request('https://habr.com/ru/rss/all/all/', (err, response, body) => {
      if (err) return console.log(err)

      return console.log(body)
    })*/


            let feed = await parser.parseURL('http://www.nintendolife.com/feeds/news');
            console.log(feed.title);
            console.log(feed.items[0])
            feed.items.forEach(item => {
                console.log('TITLE: ' + item.title + '\nTAG: tech' +'\nDESC: ' + item.contentSnippet + '\nLINK: ' + item.link + '\nPUBDATE: ' + item.isoDate + '\n')
            });/*
      feeder.add({
          url: ['http://www.nintendolife.com/feeds/news' ],

      });
      feeder.on('new-item', function(item) {
          console.log(item);
      })*/
  } catch (e) {
    console.log(e)
  }


}

start()
