const { Schema, model } = require('mongoose')
const lent = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    last_update: {
        type: Date,
        required: true
    },
    img: {
        type: String
    }
})
module.exports = model('Lent', lent)