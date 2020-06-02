const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const request = require('request')
const exphbs = require('express-handlebars')
const todoRoutes = require('./routes/todos')
let Parser = require('rss-parser');
let parser = new Parser();
const RssFeedEmitter = require('rss-feed-emitter');
const MainFeedList = require('./models/MainFeedList')
const Feed = require('./models/Feed')
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
const bodyParser = require('body-parser')
app.use(
    bodyParser.urlencoded({
      extended: true
    })
)
app.use(bodyParser.json())

async function updateFeeds() {

    const feedLists = await MainFeedList.find({});
    for (const feedList of feedLists) {
        let feed = await parser.parseURL(feedList.link);
        let resArray = [];
        if (feed.items[0].isoDate > feedList.latestFeedDate.toISOString() ) {
            feed.items.forEach(item => {
                if (item.isoDate > feedList.latestFeedDate.toISOString()) {
                    //console.log('\ntitle: '+ item.title + '\ndesc: ' + item.contentSnippet + '\nlink: ' + item.link +'\nauthor: '+ (item.creator || item.author || 'noone') + '\npubDate: ' + item.pubDate + '\nTAG: tech')
                    resArray.push({
                        title: item.title || ' ',
                        desc: item.contentSnippet || ' ',
                        link: item.guid || item.link,
                        pubDate: item.isoDate || ' ',
                        author: item.creator || item.author || 'noone',
                        parentLink: feedList.link
                    })
                }
            });
            await MainFeedList.updateOne(feedList, { $set: {latestFeedDate: feed.items[0].isoDate} });
            console.log('feed updated: ' + feed.title)
        }
        else {
            console.log('latest data received: ' + feed.title)
        }
        if (resArray.length) {
            await Feed.insertMany(resArray)
        }
    }
}
async function start() {
  try {
    await mongoose.connect(
      'mongodb+srv://george:qwertyfuck15@cluster0-bi0ip.mongodb.net/rss-aggregator',
      {
        useNewUrlParser: true,
        useFindAndModify: false
      }
    )
    app.listen(PORT, () => {
      console.log('Server has been started...')
    })

    /*let feed = await parser.parseURL('https://habr.com/ru/rss/all/all/');
    console.log(feed);
    console.log(feed.title);
    console.log(feed.items[0])
    feed.items.forEach(item => {
                console.log('TITLE: ' + item.title + '\nTAG: tech' +'\nDESC: ' + item.contentSnippet + '\nLINK: ' + item.link + '\nPUBDATE: ' + item.isoDate + '\n')
    });*/
    await updateFeeds()
  } catch (e) {
    console.log(e)
  }


}

start()
