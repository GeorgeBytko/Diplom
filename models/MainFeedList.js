const { Schema, model } = require('mongoose')
const mainFeedList = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    latestFeedDate: {
        type: Date,
        required: true
    }
})
module.exports = model('MainFeedList', mainFeedList)