const { Schema, model } = require('mongoose')
const feed = new Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    pubDate: {
        type: Date,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    parentLink: {
        type: String,
        required: true
    }
})
module.exports = model('Feed', feed)