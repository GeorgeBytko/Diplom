const { Router } = require('express')
const Todo = require('../models/Todo')
const Pizza = require('../models/Pizza')
const Roll = require('../models/Roll')
const Drink = require('../models/Drink')
const router = Router()

router.get('/', async (req, res) => {
  const todos = await Todo.find({})

  res.render('index', {
    title: 'Todos list',
    isIndex: true,
    allowProtoMethodsByDefault: true,
    todos
  })
})

router.get('/create', (req, res) => {
  res.render('create', {
    title: 'Create todo',
    isCreate: true
  })

})

router.post('/test/roll',(req,res) => {
  console.log(req.body)
  for (let key in req.body.order_) {
    console.log(key + ": " + req.body.order_[key])
  }
  res.send(req.body)
})

router.post('/create', async (req, res) => {
  const todo = new Todo({
    title: req.body.title
  })

  await todo.save()

  console.log(req.body)

  res.redirect('/')
})

router.post('/complete', async (req, res) => {
  const todo = await Todo.findById(req.body.id)

  todo.completed = !!req.body.completed
  await todo.save()

  res.redirect('/')
})



router.get('/test/roll',async (req,res)=>{

  if (req.query.getMenu) {

    const pizzas = await Pizza.find({});
    await res.json(pizzas);
  }
  else {
    res.render('index')
  }



})
module.exports = router
