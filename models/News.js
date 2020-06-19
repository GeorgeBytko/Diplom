const { Schema, model } = require('mongoose')
const news = new Schema({
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
    pub_date: {
        type: Date,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    parent_lent_title: {
        type: String,
        required: true
    },
    parent_lent_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
})
module.exports = model('News', news)