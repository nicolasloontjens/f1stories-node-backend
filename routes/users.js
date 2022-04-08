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
  try{
    let data = await userController.get(req.params.id);
    res.send(data);
  }catch(err){
    res.status(400).send({"error":"something went wrong"});
  }
})

router.post("/:id/race",async function(req,res){
  if(storyController.noToken(req)){
    res.status(401).send({"error":"no token found"});
    return;
  }
  try{
    if(await userController.addRace(req)){
      res.status(202).send({"message":"Added race!"});
    }else{
      res.status(400).send({"error":"something went wrong"});
    }
  }catch{
    res.status(400).send({"error":"something went wrong"});
  }
})

module.exports = router;
