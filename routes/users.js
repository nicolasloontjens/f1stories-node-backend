let express = require('express');
let router = express.Router();
let userController = require('../controllers/UserController')
let storyController = require('../controllers/StoryController')



router.post('/register', async function(req, res) {
  let data = await userController.register(req.body);
  if(data.success){
    res.send({token: data.token});
  }else{
    res.status(400).send({
      message:'Username taken'
    })
  }
});

router.post('/login',async function(req, res){
  let data = await userController.login(req.body);
  if(data.success){
    res.send({token: data.token})
  }else{
    res.status(400).send({
      message:'Could not log in'
    })
  }
})

router.get("/:id",async function(req, res){

})

module.exports = router;
