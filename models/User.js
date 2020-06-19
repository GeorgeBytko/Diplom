const { Schema, model } = require('mongoose')
const user = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    lents: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    dates: {
        type: Schema.Types.Mixed,
        required: true
    },
    news_all: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    news_saved: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    news_unread: {
        type: [Schema.Types.ObjectId],
        required: true
    }

})
module.exports = model('User', user)