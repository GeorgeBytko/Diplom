const { Schema, model } = require('mongoose')
const sc2 = new Schema({
    price: {
        type: Number,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }

})
module.exports = model('Roll', sc2)