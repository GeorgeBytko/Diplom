const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const exphbs = require('express-handlebars')
const todoRoutes = require('./routes/todos')
let Parser = require('rss-parser');
let parser = new Parser();
const Lent = require('./models/Lent')
const News = require('./models/News')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 3000
const app = express()
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',

})
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser('the key'))
app.use(todoRoutes)


async function updateFeeds() {

    const lents = await Lent.find({});
    for (const lent of lents) {
        let news = await parser.parseURL(lent.link);
        let resArray = [];
        if (news.items[0].isoDate > lent.last_update.toISOString() ) {
            news.items.forEach(item => {
                if (item.isoDate > lent.last_update.toISOString()) {
                    //console.log('\ntitle: '+ item.title + '\ndesc: ' + item.contentSnippet + '\nlink: ' + item.link +'\nauthor: '+ (item.creator || item.author || 'noone') + '\npubDate: ' + item.pubDate + '\nTAG: tech')
                    resArray.push({
                        title: item.title || ' ',
                        desc: item.contentSnippet || ' ',
                        link: item.guid || item.link,
                        pub_date: item.isoDate || ' ',
                        author: item.creator || item.author || 'noone',
                        parent_lent_title: lent.title,
                        parent_lent_id: lent._id
                    })
                }
            });
            await Lent.updateOne(lent, { $set: {last_update: news.items[0].isoDate} });
            console.log('feed updated: ' + news.title)
        }
        else {
            console.log('latest data received: ' + news.title)
        }
        if (resArray.length) {
            await News.insertMany(resArray)
        }
    }
}

async function start() {
  try {
    await mongoose.connect(
      'mongodb+srv://george:qwertyfuck15@cluster0-bi0ip.mongodb.net/rss-aggregatorv2',
      {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }
    )
    app.listen(PORT, () => {
      console.log('Server has been started...')
    })
    await updateFeeds()
  } catch (e) {
    console.log(e)
  }


}
start()
