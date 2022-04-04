let express = require('express');
let router = express.Router();
let storyController = require("../controllers/StoryController")

router.get("/",async function (req,res){
    res.send(await storyController.getStories(req));
});

router.post("/",async function (req, res){
    if(storyController.noToken(req)){
        res.status(401).send({"error":"no token found"});
        return;
    }
    let result = await storyController.addStory(req);
    if(result.success){
        res.status(201).send(result.story);
        return;
    }else{
        res.status(500).send({"error":"something went wrong"});
        return;
    }
})

router.put('/:id',async function (req, res){
    if(storyController.noToken(req)){
        res.status(401).send({"error":"no token found"});
        return;
    }
    let data = await storyController.updateStory(req);
    if(data){
        res.status(202).send({message:"Updated story"});
    }
    else{
        res.status(400).send({message:"Something went wrong"});
    }
})

router.delete("/:id",async function (req, res){
    if(storyController.noToken(req)){
        res.status(401).send({"error":"no token found"});
        return;
    }
    let data = await storyController.deleteStory(req);
    if(data){
        res.status(202).send({message:"Deleted story"});
    }
    else{
        res.status(400).send({message:"Something went wrong"});
    }
})

router.get("/:id/comments",async function(req, res){
    res.send(await storyController.getComments(req));
})

module.exports = router;