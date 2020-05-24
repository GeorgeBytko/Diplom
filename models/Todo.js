const { Schema, model } = require('mongoose')

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
})


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

module.exports = model('Todo', schema)
