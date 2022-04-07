let express = require('express');
let router = express.Router();
let storyController = require("../controllers/StoryController");
let commentController = require("../controllers/CommentController");

router.put("/:id",async function(req,res){
    if(storyController.noToken(req)){
        res.status(401).send({"error":"no token found"});
        return;
    }
    let data = await commentController.updateComment(req);
    if(data.success){
        res.status(200).send(data.comment[0]);
    }else{
        res.status(400).send({"error":"something went wrong"});
    }
})

router.delete("/:id",async function(req, res){
    if(storyController.noToken(req)){
        res.status(401).send({"error":"no token found"});
        return;
    }
    let data = await commentController.deleteComment(req);
})

module.exports = router;